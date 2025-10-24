
// This service assumes gapi and google are loaded from script tags in index.html
declare const gapi: any;
declare const google: any;

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let config = {
  clientId: '',
  apiKey: '',
};

const loadConfig = () => {
  config.clientId = localStorage.getItem('googleClientId') || '';
  config.apiKey = localStorage.getItem('googleApiKey') || '';
};
loadConfig(); // Load config on module initialization

export const isConfigured = (): boolean => !!(config.clientId && config.apiKey);

export const setConfig = (clientId: string, apiKey: string): void => {
  if (!clientId || !apiKey) {
    throw new Error("Client ID and API Key cannot be empty.");
  }
  config.clientId = clientId.trim();
  config.apiKey = apiKey.trim();
  localStorage.setItem('googleClientId', clientId.trim());
  localStorage.setItem('googleApiKey', apiKey.trim());
  // Reset init status so it re-initializes with new keys
  gapiInited = false;
  tokenClient = null;
};

let tokenClient: any;
let gapiInited = false;
let gapiInitializing = false;

// ---- Initialization ----

const initGapiClient = (): Promise<void> => {
    if (gapiInited) return Promise.resolve();
    if (gapiInitializing) {
        // Wait for the ongoing initialization to complete
        return new Promise(resolve => setTimeout(() => resolve(initGapiClient()), 100));
    }
    gapiInitializing = true;
    
    return new Promise((resolve, reject) => {
        gapi.load('client:picker', () => {
            gapi.client.init({
                apiKey: config.apiKey,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            }).then(() => {
                gapiInited = true;
                gapiInitializing = false;
                resolve();
            }).catch((e: any) => {
                gapiInitializing = false;
                console.error("Error initializing GAPI client", e);
                reject(new Error("Failed to initialize Google API client. Check your API Key."));
            });
        });
    });
};


const initGisClient = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isConfigured()) return reject(new Error("Missing configuration for Google Sheets."));
    if (!tokenClient) {
      try {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: config.clientId,
          scope: SCOPES,
          callback: '', // Callback is handled by the promise
        });
      } catch (e) {
        reject(e instanceof Error ? e : new Error('Failed to initialize Google Identity Services. Check your Client ID.'));
        return;
      }
    }
    resolve();
  });
};

const ensureConfiguredAndInitialized = async () => {
    if (!isConfigured()) {
        throw new Error('Google Sheets integration is not configured. Please provide your credentials.');
    }
    await initGapiClient();
    await initGisClient();
};

// ---- Authentication ----

export const handleAuthClick = (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
        await ensureConfiguredAndInitialized();
    } catch(e) {
        return reject(e);
    }

    if (gapi.client.getToken() === null) {
      tokenClient.callback = (resp: any) => {
        if (resp.error !== undefined) {
          const errorMessage = typeof resp.error === 'object' ? JSON.stringify(resp.error) : String(resp.error);
          return reject(new Error(`Authentication failed: ${errorMessage}`));
        }
        resolve();
      };
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      resolve();
    }
  });
};

// ---- Google Picker ----

export const showPicker = (): Promise<{id: string}> => {
    return new Promise(async (resolve, reject) => {
        try {
            await ensureConfiguredAndInitialized();
        } catch(e) {
            return reject(e);
        }

        const view = new google.picker.View(google.picker.ViewId.SPREADSHEETS);
        const picker = new google.picker.PickerBuilder()
            .enableFeature(google.picker.Feature.NAV_HIDDEN)
            .setAppId(config.clientId.split('-')[0])
            .setOAuthToken(gapi.client.getToken().access_token)
            .addView(view)
            .setDeveloperKey(config.apiKey)
            .setCallback((data: any) => {
                if (data.action === google.picker.Action.PICKED) {
                    const doc = data.docs[0];
                    resolve({ id: doc.id });
                } else if (data.action === google.picker.Action.CANCEL) {
                    reject(new Error('picker_closed: The user closed the file picker.'));
                }
            })
            .build();
        picker.setVisible(true);
    });
};

// ---- Sheets API ----

export const appendToSheet = async (spreadsheetId: string, values: any[]) => {
  try {
    await ensureConfiguredAndInitialized();
    // Check if sheet is empty and add headers if needed
    const getResponse = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1!A1:C1',
    });

    if (!getResponse.result.values || getResponse.result.values.length === 0) {
      const headerValues = [['Company Name', 'Date of Analysis', 'Summary']];
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A1:C1',
        valueInputOption: 'USER_ENTERED',
        resource: { values: headerValues },
      });
    }

    const response = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1!A1:C1',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [values] },
    });
    return response.result;
  } catch (err: any) {
    console.error('Error appending to sheet:', err);
    throw new Error(err.result?.error?.message || 'Failed to write to Google Sheet.');
  }
};
