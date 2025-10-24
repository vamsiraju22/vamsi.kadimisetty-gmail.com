
export const COMPANY_ANALYSIS_PROMPT = `
Do a comprehensive, multi-layered stock market analysis for [$Company Name$] listed on NSE/BSE.
Follow this structure step-by-step and use the latest available data up to today:

⸻

1. Business & Fundamental Analysis
	•	Brief company overview, business segments, and core revenue streams.
	•	Past 5 years’ financial performance (revenue, EBITDA, PAT, EPS, margins, ROE/ROCE).
	•	Debt-equity ratio, promoter holding trends, recent insider trading, and institutional investor activity.
	•	Key management insights from recent earnings calls or reports.
	•	Comparison against top 3 peers in terms of growth, profitability, and leverage.
	•	Highlight growth drivers, competitive advantages (moat), and red-flag risks.

⸻

2. Valuation Analysis
	•	Intrinsic value using DCF analysis (state assumptions for growth, discount rate, terminal value).
	•	Relative valuation using PE, PB, EV/EBITDA, EV/Sales vs historical averages and peers.
	•	Include sum-of-the-parts (SOTP) if the company has diverse business units.
	•	Provide a sensitivity table (valuation vs growth/discount rate changes).
	•	Conclude with bull / base / bear-case valuation ranges and whether the stock is undervalued, fairly valued, or overvalued at today’s price.

⸻

3. Sector & Macro Context
	•	Analyze how India’s macroeconomic trends (interest rates, inflation, fiscal/monetary policies, rupee vs USD, global commodity prices) impact the [SECTOR NAME] sector.
	•	Compare the top 5 companies in this sector for market share, capex plans, and policy exposure.
	•	Identify regulatory or technology shifts that may disrupt the sector.
	•	State which player is best positioned for 3-5 years of growth and why.

⸻

4. Technical & Price Action Analysis
	•	Multi-timeframe chart analysis (daily, weekly, monthly).
	•	Identify support & resistance, moving averages, RSI, MACD, Bollinger Bands, volume profile, and recent breakouts or reversals.
	•	Include F&O trends: open interest, PCR, delivery volumes, FII/DII activity.
	•	State short-term (1-3 months) and medium-term (6-12 months) bullish/bearish bias with potential entry/exit points and stop-loss levels.

⸻

5. Portfolio Fit & Risk Assessment
	•	If I hold a portfolio: [LIST YOUR STOCKS + % ALLOCATIONS].
	•	Evaluate sector concentration, volatility, and correlation among holdings.
	•	Highlight over-exposed or underperforming areas and recommend reallocation to optimize risk-adjusted returns.
	•	Suggest 3–5 emerging opportunities in the Indian market that complement this portfolio.
	•	Outline key risks (regulatory, geopolitical, interest-rate, currency, demand-supply, etc.) to watch.

⸻

6. Actionable Insights & Recommendation
	•	Summarize the analysis in plain language:
	•	Short-term (1-6 months) outlook
	•	Medium-term (6-18 months) outlook
	•	Long-term (3-5 years) investment thesis
	•	Provide a clear call-to-action (buy / accumulate / hold / avoid / exit) with reasoning.
	•	Note key price levels or triggers that could change your recommendation.

⸻

Use structured headings, tables for ratios and valuations, and concise bullet points for clarity.

⸻

7. Executive Summary
Provide a single, concise paragraph summarizing the key findings and overall recommendation. Start this section with the exact markdown heading: "### Executive Summary". This is for automated processing, so the heading format must be exact.
`;

export const BROKERAGE_ANALYSIS_PROMPT = `
Objective:
Fetch the latest brokerage recommendations (past 30–45 days) where brokers have initiated, re-initiated, or upgraded/downgraded coverage on listed Indian equities.

Requirements:

1.  **Exhaustive Search**: You MUST perform a comprehensive search across all of the following major public sources. Do not skip any sources from this list. The goal is a complete and thorough summary.
    *   **News Outlets**: Economic Times, Moneycontrol, NDTVProfit, Business Standard, Financial Express, Reuters, BloombergQuint, Investing.com, Livemint.
    *   **Broker Websites/Reports**: Motilal Oswal, Nuvama, ICICI Securities, Kotak, JM Financial, Axis Capital, Antique, Centrum, Ambit, Prabhudas Lilladher, Goldman Sachs, Nomura, Jefferies, CLSA, Citi, Morgan Stanley, UBS, Bernstein, JPMorgan.

2.  **Scope**: Include both domestic and global brokers covering Indian equities.

3.  **Data Extraction**: Extract and tabulate for each initiation or fresh rating:
    *   Brokerage Name
    *   Stock Name (include ticker if available)
    *   Rating / Call (e.g., Buy, Sell, Add, Neutral, Outperform, Underperform)
    *   Initiation (Yes / No — mark “Yes” if report explicitly says initiates coverage or re-initiates)
    *   Target Price (₹ value if mentioned)
    *   Implied Upside (%) (if reported or computable)
    *   Analyst Name (if available in source or PDF)
    *   Date (of report or publication)
    *   Source URL (official broker note or top-tier news outlet)

4.  **Recency**: Prefer most recent coverage (within 30–45 days). Ignore repeats or outdated items.

Format output as a clean markdown table grouped by brokerage.

After the table, provide:

- A short trend summary (which sectors have maximum new buys/sells).
- Note any multiple-broker consensus initiations (e.g., stocks covered by 2+ brokers recently).

Finally, add a section at the very end under a markdown heading "### Column Definitions". In this section, provide brief, clear, one-sentence explanations for the following columns to help users understand the data: 'Rating / Call', 'Initiation', and 'Implied Upside (%)'.

Tone: Concise, factual, data-first. Include verified, attributable sources only.

Output style:

- Use one table, sorted by brokerage name.
- No CSV download; show in markdown.
- **Crucially, format the Source URL as a clickable markdown link, like \`[Source Title](URL)\`.**

Time frame: Past 30–45 days (if no explicit date, assume within this window).

Goal: Deliver an up-to-date, research-grade summary of brokerage initiations and major calls in the Indian market, suitable for portfolio monitoring and market intelligence dashboards.
`;

export const BROKERAGE_PROMPT_DESCRIPTION = "Fetches the latest brokerage recommendations (past 30–45 days) for Indian equities, summarizing new coverage, upgrades, and downgrades from major domestic and global brokers into a comprehensive table and trend summary.";