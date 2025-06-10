import React, { useState, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// --- Main App Component ---
export default function USGSGaugeApp() {
    // --- State Variables ---
    const [gaugeNumber, setGaugeNumber] = useState('12510500'); // Default to Columbia River at Richland, WA
    const [data, setData] = useState(null);
    const [stats, setStats] = useState(null);
    const [gaugeName, setGaugeName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // --- Data Fetching and Processing ---
    const processAPIData = useCallback((apiData) => {
        if (!apiData?.value?.timeSeries?.[0]?.values?.[0]?.value) {
            throw new Error("The API returned no valid data for this gauge. Please check the gauge number.");
        }
        
        // Extract Site Name
        const siteName = apiData.value.timeSeries[0].sourceInfo.siteName;
        setGaugeName(siteName);

        const allValues = apiData.value.timeSeries[0].values[0].value;

        // Get today's and yesterday's dates
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const todayString = today.toISOString().split('T')[0];
        const yesterdayString = yesterday.toISOString().split('T')[0];
        const monthDayForComparison = today.toISOString().substring(5, 10); // Day of year for historical comparison

        // Find the most recent discharge value (try today, then fall back to yesterday)
        let mostRecentDataPoint = allValues.find(d => d.dateTime.startsWith(todayString));
        let dateUsedForStat = todayString;

        if (!mostRecentDataPoint) {
            mostRecentDataPoint = allValues.find(d => d.dateTime.startsWith(yesterdayString));
            dateUsedForStat = yesterdayString;
        }
        
        if (!mostRecentDataPoint) {
             throw new Error(`No data available for today or yesterday. The gauge might not have reported recently.`);
        }

        const mostRecentDischarge = parseFloat(mostRecentDataPoint.value);

        // Filter for historical data on the same month-day for the last 10 years, excluding the date we're using for the main stat
        const historicalValues = allValues
            .filter(d => d.dateTime.substring(5, 10) === monthDayForComparison && !d.dateTime.startsWith(dateUsedForStat))
            .map(d => ({
                year: d.dateTime.substring(0, 4),
                discharge: parseFloat(d.value)
            }));
            
        if (historicalValues.length === 0) {
            throw new Error("No historical data could be found for this date to perform a comparison.");
        }

        // Calculate statistics
        const historicalDischarges = historicalValues.map(v => v.discharge);
        const sum = historicalDischarges.reduce((a, b) => a + b, 0);
        const mean = sum / historicalDischarges.length;
        
        const sortedHistorical = [...historicalDischarges].sort((a, b) => a - b);
        const countBelow = sortedHistorical.filter(v => v < mostRecentDischarge).length;
        const percentile = (countBelow / sortedHistorical.length) * 100;

        setData(historicalValues);
        setStats({
            today: mostRecentDischarge,
            mean: mean,
            percentile: percentile,
            unit: apiData.value.timeSeries[0].variable.unit.unitCode,
            dateUsed: dateUsedForStat
        });

    }, []);

    const fetchData = useCallback(async () => {
        if (!gaugeNumber) {
            setError("Please enter a USGS gauge number.");
            return;
        }

        setIsLoading(true);
        setError('');
        setData(null);
        setStats(null);
        setGaugeName('');

        // Define the 10-year date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 10);
        
        const formatDate = (date) => date.toISOString().split('T')[0];
        const startDateString = formatDate(startDate);
        const endDateString = formatDate(endDate);
        
        const parameterCode = '00060'; // Discharge, cubic feet per second
        const url = `https://waterservices.usgs.gov/nwis/dv/?format=json&sites=${gaugeNumber}&parameterCd=${parameterCode}&startDT=${startDateString}&endDT=${endDateString}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }
            const apiData = await response.json();
            processAPIData(apiData);
        } catch (err) {
            console.error("Fetch or processing error:", err);
            setError(`Failed to fetch or process data. ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [gaugeNumber, processAPIData]);
    
    // Automatically fetch data on initial load
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSampleClick = (sampleGauge) => {
        setGaugeNumber(sampleGauge);
    }
    
    // --- Render Logic ---
    return (
        <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
                {/* --- Header --- */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">USGS Streamflow Analyzer</h1>
                    <p className="text-md text-gray-500 mt-2">Compare recent stream discharge to the last 10 years.</p>
                </div>
                
                {/* --- Input Form --- */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <input
                        type="text"
                        value={gaugeNumber}
                        onChange={(e) => setGaugeNumber(e.target.value)}
                        placeholder="e.g., 12510500"
                        className="w-full sm:w-64 p-3 border border-gray-300 rounded-lg text-center text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                        onClick={fetchData}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-wait"
                    >
                        {isLoading ? 'Loading...' : 'Analyze Flow'}
                    </button>
                </div>
                 {/* --- Sample Gauges --- */}
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 mb-2">Or try a sample gauge:</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                        <button onClick={() => handleSampleClick('09380000')} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded-full transition-colors">Colorado River (Grand Canyon)</button>
                        <button onClick={() => handleSampleClick('07010000')} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded-full transition-colors">Mississippi River (St. Louis)</button>
                        <button onClick={() => handleSampleClick('14105700')} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded-full transition-colors">Columbia River (The Dalles)</button>
                    </div>
                </div>
                
                {/* --- Error Display --- */}
                {error && (
                    <div className="my-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-lg text-center">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {/* --- Results Display --- */}
                {stats && data && (
                    <div className="animate-fade-in mt-8">
                        {/* --- Gauge Name Header --- */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-700">{gaugeName}</h2>
                        </div>
                        {/* --- Stats Cards --- */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-center mb-8">
                            <div className="bg-blue-50 p-4 rounded-lg shadow">
                                <h3 className="text-sm font-semibold text-blue-800 uppercase">Most Recent Discharge</h3>
                                <p className="text-3xl font-bold text-blue-900">{stats.today.toLocaleString()}<span className="text-lg ml-1">{stats.unit}</span></p>
                                <p className="text-xs text-gray-500">({new Date(stats.dateUsed + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg shadow">
                                <h3 className="text-sm font-semibold text-green-800 uppercase">10-Year Mean (for this day)</h3>
                                <p className="text-3xl font-bold text-green-900">{stats.mean.toFixed(0).toLocaleString()}<span className="text-lg ml-1">{stats.unit}</span></p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg shadow">
                                <h3 className="text-sm font-semibold text-purple-800 uppercase">Percentile</h3>
                                <p className="text-3xl font-bold text-purple-900">{stats.percentile.toFixed(1)}<span className="text-lg">%</span></p>
                                <p className="text-xs text-gray-500">Higher than {stats.percentile.toFixed(0)}% of past flows</p>
                            </div>
                        </div>

                        {/* --- Chart --- */}
                        <div className="w-full h-80 md:h-96 bg-gray-50 p-4 rounded-lg shadow-inner">
                             <h3 className="text-lg font-semibold text-gray-700 text-center mb-4">Historical Discharge for this Day ({new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })})</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data}
                                    margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="year" tick={{fontSize: 12}} />
                                    <YAxis 
                                        tick={{fontSize: 12}}
                                        label={{ value: `Discharge (${stats.unit})`, angle: -90, position: 'insideLeft', offset: 0, style: {textAnchor: 'middle'} }} 
                                    />
                                    <Tooltip
                                        formatter={(value) => `${value.toLocaleString()} ${stats.unit}`}
                                        cursor={{fill: 'rgba(230, 247, 255, 0.5)'}}
                                    />
                                    <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '20px'}}/>
                                    <Bar dataKey="discharge" name="Historical Discharge" fill="#8884d8" />
                                    <ReferenceLine 
                                        y={stats.today} 
                                        label={{ value: `Recent: ${stats.today.toLocaleString()}`, position: 'insideTopRight', fill: '#d63333' }} 
                                        stroke="#d63333" 
                                        strokeWidth={2} 
                                        strokeDasharray="3 3" 
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
