# Deploying Mutanex My Twin Portal to Google Cloud Run

This guide provides instructions to host the **Mutanex My Twin Portal** on **Google Cloud Run**.

---

## Why Google Cloud Run?

- **Serverless & Cost-Effective**: Scales to **0 instances** when inactive, so you pay **$0** when no traffic is visiting.
- **Fast Global HTTPS**: Provides a managed SSL/TLS URL (`https://...a.run.app`) automatically.
- **Custom Domains**: Point your own domain or subdomain (e.g. `twin.mutanex.com`).
- **AI Backend Ready**: Runs the combined static portal and the Gemini-powered AI backend (`/v1/ask` with Google Search grounding).

---

## Method 1: Google Cloud Shell (Recommended & Fastest — No Local Installs)

If you don't have Google Cloud SDK or Docker installed on your Windows PC, this is the easiest method:

1. Open your browser and go to [Google Cloud Shell](https://shell.cloud.google.com).
2. Click the three dots `⋮` in the top-right corner of Cloud Shell and select **Upload**.
3. Upload the `Mutanex_MyTwin_Portal` folder (or zip it and unzip in Cloud Shell).
4. Run:
   ```bash
   cd Mutanex_MyTwin_Portal
   chmod +x deploy_cloud_run.sh
   ./deploy_cloud_run.sh
   ```
5. It will prompt for your Project ID (if not already set), enable Cloud Run & Cloud Build, build the container in the cloud, and print your live **HTTPS URL**.

---

## Method 2: From Your Local Windows Terminal (PowerShell)

If you have Google Cloud SDK (`gcloud`) installed locally:

1. Open PowerShell in this folder (`c:\Users\saifu\Desktop\Mutanex_MyTwin_Portal`).
2. Log in and configure your project (if not done yet):
   ```powershell
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
3. Run the automated deployment script:
   ```powershell
   .\deploy_cloud_run.ps1
   ```
   *Optional:* Pass your Gemini API Key directly:
   ```powershell
   .\deploy_cloud_run.ps1 -GeminiApiKey "YOUR_GEMINI_KEY"
   ```

Or run the single `gcloud` command directly:
```powershell
gcloud run deploy mutanex-portal `
  --source . `
  --region us-central1 `
  --platform managed `
  --allow-unauthenticated
```

---

## Method 3: Continuous Deployment via GitHub & Cloud Run Console

If your code is in a GitHub repository:

1. Push your workspace to GitHub.
2. In the Google Cloud Console, open **Cloud Run** (`https://console.cloud.google.com/run`).
3. Click **Deploy Container** > **Service**.
4. Select **Continuously deploy from a repository** and click **Set up with Cloud Build**.
5. Connect your GitHub account and select your repository and branch (`main`).
6. Build Type: **Dockerfile** (path: `/Dockerfile`).
7. Under **Authentication**, select **Allow unauthenticated invocations**.
8. Click **Create**. Every future `git push` will automatically build and deploy a new revision.

---

## Configuring Environment Variables

In the Cloud Run Console (or via `--set-env-vars`), you can set:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | *(empty)* | Optional. Enables Gemini 2.0 / 1.5 Flash AI assistant with Google Search grounding at `/v1/ask`. |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Gemini model name for the AI assistant. |
| `PORT` | `8080` | Automatically injected by Google Cloud Run. |

To update environment variables on an existing Cloud Run service:
```powershell
gcloud run services update mutanex-portal `
  --region us-central1 `
  --update-env-vars GEMINI_API_KEY="YOUR_KEY_HERE"
```

---

## Mapping a Custom Domain

1. In Google Cloud Console, navigate to **Cloud Run** > **Manage Custom Domains**.
2. Click **Add Mapping**.
3. Select your service (`mutanex-portal`) and enter your domain name (e.g., `twin.yourdomain.com`).
4. Update your DNS records (CNAME or A/AAAA) as shown by Google. Google Cloud Run automatically provisions free managed SSL certificates.
