import argparse
import json
import os
from datetime import datetime

# Import functions from the modified fetch and process modules
from utils.fetch_github_data_for_static import (
    fetch_contribution_data,
    fetch_user_data,
    fetch_repo_data,
    fetch_data_for_duration,
)
from utils.process_github_data import (
    process_contribution_data,
    process_language_data,
    process_user_data,
    analyze_contributions,
)
from utils.util import format_date_ddmmyyyy # This utility is needed for analyze_contributions

def generate_data(username: str, token: str):
    """
    Fetches and processes GitHub data, then saves it to a JSON file.
    """
    all_data = {}

    # Fetch and process user data
    user_data = fetch_user_data(username, token)
    if "errors" in user_data:
        print(f"Error fetching user data: {user_data['errors']}")
        return
    processed_user_data = process_user_data(user_data)
    all_data["user_stats"] = processed_user_data

    # Fetch and process contribution data
    cont_data = fetch_contribution_data(username, token)
    if "errors" in cont_data:
        print(f"Error fetching contribution data: {cont_data['errors']}")
        return
    processed_cont_data = process_contribution_data(cont_data)
    all_data["contribution_stats"] = processed_cont_data

    # Fetch and process repo data
    repo_data = fetch_repo_data(username, token)
    if "errors" in repo_data:
        print(f"Error fetching repository data: {repo_data['errors']}")
        return
    processed_language_data = process_language_data(repo_data)
    all_data["language_data"] = processed_language_data
    
    # --- Yearly and Monthly Growth (Similar to app.py logic) ---
    today = datetime.now()
    current_year = today.year
    last_year = current_year - 1

    # Current year contributions
    current_jan1st = datetime(current_year, 1, 1).strftime("%Y-%m-%d")
    
    # Determine 'from_date' for current year based on user creation date
    created_at_str = processed_user_data.get("created_at")
    created_at_dt = datetime.strptime(created_at_str, "%Y-%m-%dT%H:%M:%SZ") if created_at_str else datetime(1970, 1, 1)

    current_year_from_date = current_jan1st
    if created_at_dt > datetime.strptime(current_jan1st, "%Y-%m-%d"):
        current_year_from_date = created_at_dt.strftime("%Y-%m-%d")

    current_year_raw_data = fetch_data_for_duration(username, token, current_year_from_date, today.strftime("%Y-%m-%d"))
    if "errors" in current_year_raw_data:
        print(f"Error fetching current year data: {current_year_raw_data['errors']}")
        return
    current_year_stats = analyze_contributions(current_year_raw_data)
    all_data["current_year_stats"] = current_year_stats

    # Last year contributions
    last_jan1st = datetime(last_year, 1, 1).strftime("%Y-%m-%d")
    last_dec31st = datetime(last_year, 12, 31).strftime("%Y-%m-%d")

    last_year_from_date = last_jan1st
    last_year_data_present = True
    if created_at_dt > datetime.strptime(last_dec31st, "%Y-%m-%d"): # User created after last year ended
        last_year_data_present = False
    elif created_at_dt > datetime.strptime(last_jan1st, "%Y-%m-%d"): # User created last year
        last_year_from_date = created_at_dt.strftime("%Y-%m-%d")
    
    if last_year_data_present:
        last_year_raw_data = fetch_data_for_duration(username, token, last_year_from_date, last_dec31st)
        if "errors" in last_year_raw_data:
            print(f"Error fetching last year data: {last_year_raw_data['errors']}")
            return
        last_year_stats = analyze_contributions(last_year_raw_data)
        all_data["last_year_stats"] = last_year_stats
    else:
        all_data["last_year_stats"] = {"info": f"No Data for year {last_year}"}
    
    # Extract contribution days for charts
    contribution_days = processed_cont_data.get("days", [])
    all_data["chart_data"] = [
        {"date": day["date"], "contributions": day["contributionCount"]}
        for day in contribution_days
    ]

    # Save to JSON
    output_dir = "static/data"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "github_data.json")

    with open(output_path, "w") as f:
        json.dump(all_data, f, indent=4)
    
    print(f"Successfully generated static data to {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate static GitHub data for GitHub Pages.")
    parser.add_argument("--username", required=True, help="GitHub username")
    parser.add_argument("--token", required=True, help="GitHub Personal Access Token (PAT)")
    
    args = parser.parse_args()
    generate_data(args.username, args.token)