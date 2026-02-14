document.addEventListener('DOMContentLoaded', () => {
    fetch('static/data/github_data.json')
        .then(response => response.json())
        .then(data => {
            console.log("Fetched Data:", data); // Debugging
            displayUserSummary(data.user_stats, data.contribution_stats);
            displayGrowthStats(data.current_year_stats, data.last_year_stats);
            renderContributionsOverTimeChart(data.chart_data);
            renderMonthlyGrowthChart(data.chart_data);
            renderYearlyGrowthChart(data.chart_data);
            renderWeekdayWeekendChart(data.chart_data);
            renderDayOfWeekChart(data.chart_data);
            renderLanguageDistribution(data.language_data);
            displayAchievements(data.contribution_stats); // New call
        })
        .catch(error => console.error('Error loading GitHub data:', error));
});

function displayUserSummary(userStats, contributionStats) {
    if (!userStats || !contributionStats) {
        console.error("User stats or contribution stats are missing.");
        return;
    }

    // User Card
    document.getElementById('avatar').src = userStats.avatar_url;
    document.getElementById('username').textContent = userStats.name || userStats.login; // Use login if name is not set
    document.getElementById('bio').textContent = userStats.bio;
    document.getElementById('location').textContent = userStats.location;
    document.getElementById('repositories').textContent = userStats.repositories;
    document.getElementById('followers').textContent = userStats.followers;
    document.getElementById('following').textContent = userStats.following;
    document.getElementById('total_prs').textContent = userStats.total_pullrequests;
    document.getElementById('total_issues').textContent = userStats.total_issues;

    // Summary Metrics
    document.getElementById('total_contributions').textContent = `${contributionStats.total_contributions.toLocaleString()} commits`;
    document.getElementById('public_private_contributions').textContent = `Public: ${contributionStats.public_contributions.toLocaleString()} | Private: ${contributionStats.private_contributions.toLocaleString()}`;

    document.getElementById('current_streak').textContent = `${contributionStats.current_streak} days`;
    document.getElementById('longest_streak').textContent = `Longest: ${contributionStats.longest_streak} days`;

    document.getElementById('highest_contribution').textContent = `${contributionStats.highest_contribution} commits`;
    document.getElementById('highest_contribution_date').textContent = contributionStats.highest_contribution_date || 'No activity found';

    document.getElementById('joined_date').textContent = userStats.formatted_date;
    document.getElementById('joined_duration').textContent = userStats.joined_since;

    document.getElementById('github_days').textContent = `${userStats.github_days} days`;
    document.getElementById('active_days').textContent = `Active for: ${contributionStats.active_days} days`;
}

function displayGrowthStats(currentYearStats, lastYearStats) {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // Last Year
    document.getElementById('last-year-label').textContent = lastYear;
    if (lastYearStats && lastYearStats.total_contributions !== undefined) {
        document.getElementById('last-year-total-contributions').textContent = `${lastYearStats.total_contributions.toLocaleString()} contributions`;
        document.getElementById('last-year-contribution-rate').textContent = `${lastYearStats.contribution_rate} / day`;
        document.getElementById('last-year-active-days').textContent = `${lastYearStats.active_days} days`;
    } else {
        document.getElementById('last-year-total-contributions').textContent = "No data available";
        document.getElementById('last-year-contribution-rate').textContent = "N/A";
        document.getElementById('last-year-active-days').textContent = "N/A";
    }

    // Current Year
    document.getElementById('current-year-label').textContent = currentYear;
    if (currentYearStats && currentYearStats.total_contributions !== undefined) {
        document.getElementById('current-year-total-contributions').textContent = `${currentYearStats.total_contributions.toLocaleString()} contributions`;
        document.getElementById('current-year-contribution-rate').textContent = `${currentYearStats.contribution_rate} / day`;
        document.getElementById('current-year-active-days').textContent = `${currentYearStats.active_days} days`;
    } else {
        document.getElementById('current-year-total-contributions').textContent = "No data available";
        document.getElementById('current-year-contribution-rate').textContent = "N/A";
        document.getElementById('current-year-active-days').textContent = "N/A";
    }
}

function renderContributionsOverTimeChart(chartData) {
    const dates = chartData.map(d => d.date);
    const contributions = chartData.map(d => d.contributions);

    const data = [{
        x: dates,
        y: contributions,
        mode: 'lines+markers',
        type: 'scatter',
        marker: { color: '#26a641' },
        line: { color: '#26a641' }
    }];

    const layout = {
        title: 'Contributions Over Time',
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: 'white' },
        xaxis: { showgrid: false },
        yaxis: { title: 'Contributions', showgrid: true, gridcolor: 'rgba(128,128,128,0.2)' }
    };

    Plotly.newPlot('contributions-over-time-chart', data, layout);
}

function renderMonthlyGrowthChart(chartData) {
    // Group by month
    const monthlyData = {};
    chartData.forEach(d => {
        const date = new Date(d.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = 0;
        }
        monthlyData[monthYear] += d.contributions;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const months = sortedMonths.map(my => {
        const date = new Date(my);
        return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    });
    const contributions = sortedMonths.map(my => monthlyData[my]);

    const data = [{
        x: months,
        y: contributions,
        type: 'bar',
        marker: { color: '#26a641' }
    }];

    const layout = {
        title: 'Monthly Growth',
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: 'white' },
        xaxis: { showgrid: false },
        yaxis: { title: 'Contributions', showgrid: true, gridcolor: 'rgba(128,128,128,0.2)' }
    };

    Plotly.newPlot('monthly-growth-chart', data, layout);
}

function renderYearlyGrowthChart(chartData) {
    // Group by year
    const yearlyData = {};
    chartData.forEach(d => {
        const date = new Date(d.date);
        const year = date.getFullYear();
        if (!yearlyData[year]) {
            yearlyData[year] = 0;
        }
        yearlyData[year] += d.contributions;
    });

    const sortedYears = Object.keys(yearlyData).sort();
    const years = sortedYears.map(y => parseInt(y));
    const contributions = sortedYears.map(y => yearlyData[y]);

    const data = [{
        x: years,
        y: contributions,
        type: 'bar',
        marker: { color: '#26a641' }
    }];

    const layout = {
        title: 'Yearly Growth',
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: 'white' },
        xaxis: { showgrid: false, type: 'category' }, // Use 'category' for discrete years
        yaxis: { title: 'Contributions', showgrid: true, gridcolor: 'rgba(128,128,128,0.2)' }
    };

    Plotly.newPlot('yearly-growth-chart', data, layout);
}

function renderWeekdayWeekendChart(chartData) {
    let weekdayContributions = 0;
    let weekendContributions = 0;

    chartData.forEach(d => {
        const date = new Date(d.date);
        const dayOfWeek = date.getDay(); // 0 for Sunday, 6 for Saturday
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
            weekendContributions += d.contributions;
        } else {
            weekdayContributions += d.contributions;
        }
    });

    const data = [{
        x: [weekdayContributions, weekendContributions],
        y: ['Weekdays', 'Weekends'],
        type: 'bar',
        orientation: 'h',
        marker: { color: ['#26a641', '#1e7f34'] } // Different shades for distinction
    }];

    const layout = {
        title: 'Weekday vs. Weekend Contributions',
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: 'white' },
        xaxis: { title: 'Contributions', showgrid: true, gridcolor: 'rgba(128,128,128,0.2)' },
        yaxis: { showgrid: false }
    };

    Plotly.newPlot('weekday-weekend-chart', data, layout);
}

function renderDayOfWeekChart(chartData) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayContributions = new Array(7).fill(0);

    chartData.forEach(d => {
        const date = new Date(d.date);
        const dayOfWeek = date.getDay(); // 0 for Sunday, 6 for Saturday
        dayContributions[dayOfWeek] += d.contributions;
    });

    const data = [{
        x: dayContributions,
        y: dayNames,
        type: 'bar',
        orientation: 'h',
        marker: { color: '#26a641' }
    }];

    const layout = {
        title: 'Contributions By Day of Week',
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: 'white' },
        xaxis: { title: 'Contributions', showgrid: true, gridcolor: 'rgba(128,128,128,0.2)' },
        yaxis: { automargin: true, showgrid: false } // automargin to prevent labels being cut off
    };

    Plotly.newPlot('day-of-week-chart', data, layout);
}

function renderLanguageDistribution(languageData) {
    if (!languageData) {
        console.warn("No language data available.");
        return;
    }

    const languages = Object.keys(languageData);
    const counts = languages.map(lang => languageData[lang].count);
    const colors = languages.map(lang => languageData[lang].color);

    // Sort languages by count for table and take top 6 + others
    const sortedLanguages = Object.entries(languageData).sort(([, a], [, b]) => b.count - a.count);
    const topLanguages = sortedLanguages.slice(0, 6);
    const remainingLanguages = sortedLanguages.slice(6);

    let othersCount = 0;
    if (remainingLanguages.length > 0) {
        othersCount = remainingLanguages.reduce((sum, [, data]) => sum + data.count, 0);
        topLanguages.push(["Others", { count: othersCount, color: "#808080" }]);
    }

    // Populate language table
    const languageTableBody = document.querySelector('#language-table tbody');
    languageTableBody.innerHTML = ''; // Clear previous content
    let totalRepos = 0;
    sortedLanguages.forEach(([, data]) => totalRepos += data.count);

    topLanguages.forEach(([lang, data]) => {
        const row = languageTableBody.insertRow();
        row.insertCell().textContent = lang;
        row.insertCell().textContent = data.count;
        row.insertCell().textContent = `${((data.count / totalRepos) * 100).toFixed(1)}%`;
    });

    // Create pie chart data for Plotly
    const pieLabels = topLanguages.map(([lang,]) => lang);
    const pieValues = topLanguages.map(([, data]) => data.count);
    const pieColors = topLanguages.map(([, data]) => data.color);

    const data = [{
        values: pieValues,
        labels: pieLabels,
        type: 'pie',
        marker: { colors: pieColors },
        hoverinfo: 'label+percent',
        textinfo: 'percent',
        insidetextorientation: 'radial'
    }];

    const layout = {
        title: 'Programming Languages',
        height: 400,
        width: 400,
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: 'white' },
        showlegend: true,
        legend: { x: 1, y: 0.5 } // Position legend outside to the right
    };

    Plotly.newPlot('language-pie-chart', data, layout);
}

function displayAchievements(contributionStats) {
    const currentStreak = contributionStats.current_streak;
    const totalContributions = contributionStats.total_contributions;

    const streakAchievements = {
        "Streak Beginner": { required: 2, criteria: "Made contributions for 2 consecutive days" },
        "Streak Novice": { required: 7, criteria: "Made contributions for 7 consecutive days" },
        "Streak Apprentice": { required: 14, criteria: "Made contributions for 14 consecutive days" },
        "Streak Journeyman": { required: 30, criteria: "Made contributions for 30 consecutive days" },
        "Streak Expert": { required: 60, criteria: "Made contributions for 60 consecutive days" },
        "Streak Master": { required: 90, criteria: "Made contributions for 90 consecutive days" },
        "Streak Legend": { required: 120, criteria: "Made contributions for 120+ consecutive days" }
    };

    const contributionAchievements = {
        "Contributor": { required: 50, criteria: "Made your first 50 contributions" },
        "Regular Contributor": { required: 100, criteria: "Reached 100 total contributions" },
        "Active Contributor": { required: 500, criteria: "Reached 500 total contributions" },
        "Dedicated Contributor": { required: 1000, criteria: "Reached 1,000 total contributions" },
        "Seasoned Contributor": { required: 5000, criteria: "Reached 5,000 total contributions" },
        "GitHub Legend": { required: 10000, criteria: "Reached 10,000+ total contributions" }
    };

    const streakList = document.getElementById('streak-achievements-list');
    const contributionList = document.getElementById('contribution-achievements-list');

    function createAchievementItem(title, details, current, listElement) {
        const li = document.createElement('li');
        let emoji, statusClass;
        if (current >= details.required) {
            emoji = "✅";
            statusClass = "unlocked";
            li.innerHTML = `${emoji} <span class="${statusClass}">${title}</span>: <em>${details.criteria}</em>`;
        } else {
            emoji = "🔒";
            statusClass = "locked";
            const progress = ((current / details.required) * 100).toFixed(1);
            li.innerHTML = `${emoji} <span class="${statusClass}">${title}</span>: <em>${details.criteria}</em> (Progress: ${progress}%)`;
        }
        listElement.appendChild(li);
    }

    for (const title in streakAchievements) {
        createAchievementItem(title, streakAchievements[title], currentStreak, streakList);
    }

    for (const title in contributionAchievements) {
        createAchievementItem(title, contributionAchievements[title], totalContributions, contributionList);
    }
}