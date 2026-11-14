#!/usr/bin/env bash
# =====================================================================
# Mutanex My Twin Portal - Google Cloud Run Deployment Script
# Works on Google Cloud Shell, Linux, and macOS
# =====================================================================

set -e

PROJECT_ID="${1:-}"
REGION="${2:-us-central1}"
SERVICE_NAME="${3:-mutanex-portal}"
GEMINI_KEY="${4:-}"

echo "=========================================================="
echo "      Mutanex My Twin Portal - Google Cloud Run Deploy     "
echo "=========================================================="

# 1. Check for gcloud
if ! command -v gcloud &> /dev/null; then
    echo "[ERROR] Google Cloud SDK ('gcloud') is not found."
    echo "If running locally, please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    echo "Or run this inside Google Cloud Shell (https://shell.cloud.google.com) which has gcloud preinstalled."
    exit 1
fi

# 2. Project ID selection
if [ -z "$PROJECT_ID" ]; then
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || true)
    if [ -n "$CURRENT_PROJECT" ] && [ "$CURRENT_PROJECT" != "(unset)" ]; then
        PROJECT_ID="$CURRENT_PROJECT"
        echo "Using active GCP project: $PROJECT_ID"
    else
        read -rp "Enter your Google Cloud Project ID: " PROJECT_ID
        if [ -z "$PROJECT_ID" ]; then
            echo "[ERROR] Project ID is required."
            exit 1
        fi
    fi
fi

echo "Setting Google Cloud project to: $PROJECT_ID..."
gcloud config set project "$PROJECT_ID"

# 3. Enable required APIs
echo "Enabling Cloud Run and Cloud Build APIs (one-time setup)..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 4. Deploy to Cloud Run
echo "Deploying '$SERVICE_NAME' to Google Cloud Run in '$REGION'..."

DEPLOY_CMD=(
    gcloud run deploy "$SERVICE_NAME"
    --source .
    --region "$REGION"
    --platform managed
    --allow-unauthenticated
)

if [ -n "$GEMINI_KEY" ]; then
    DEPLOY_CMD+=(--set-env-vars "GEMINI_API_KEY=$GEMINI_KEY")
fi

"${DEPLOY_CMD[@]}"

echo ""
echo "=========================================================="
echo "  SUCCESS! Your Mutanex Twin Portal is now live on Cloud Run! "
echo "=========================================================="
