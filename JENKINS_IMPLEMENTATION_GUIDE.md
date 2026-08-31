# ✅ Module 2: Jenkins Setup & CI/CD Pipeline — Implementation Checklist

## 🔧 Prerequisites
- [ ] AWS EC2-1 instance running (t3.medium, Ubuntu 22.04 LTS)
- [ ] GitHub account with repository access
- [ ] SonarQube instance ready (Module 3)
- [ ] Kubernetes cluster set up (Module 2 Part 2)
- [ ] AWS ECR repository created for `veltrix-backend` and `veltrix-frontend`
- [ ] Docker installed locally for testing

---

## 📝 Phase 1: Jenkins Installation & Setup (EC2-1)

### Step 1.1: Run Jenkins Installation Script
```bash
# On EC2-1 instance
chmod +x infrastructure/scripts/install-jenkins.sh
./infrastructure/scripts/install-jenkins.sh
```

**Expected Output:**
```
Jenkins installed successfully!
Service status: active
Initial Admin Password: [paste in Step 1.2]
```

### Step 1.2: Access Jenkins UI & Unlock
1. Open browser: `http://<EC2-1-IP>:8080`
2. Retrieve initial password:
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```
3. Paste password into Jenkins UI
4. Click **"Create First Admin User"**
   - Username: `jenkins`
   - Password: `<strong-password>`
   - Full name: `Jenkins Admin`
   - Email: `jenkins@veltrix.io`

### Step 1.3: Install Required Plugins
**Path:** Manage Jenkins → Manage Plugins → Available tab

**Search & Install:**
- [ ] Docker Pipeline
- [ ] Kubernetes
- [ ] SonarQube Scanner
- [ ] Blue Ocean
- [ ] GitHub Integration
- [ ] Amazon ECR
- [ ] Pipeline: Stage View

Click "Install without restart" → "Restart Jenkins when installation is complete"

### Step 1.4: Configure Jenkins System Settings
**Path:** Manage Jenkins → System

**Configure:**
- [ ] **GitHub Server:** Add API URL: `https://api.github.com`
- [ ] **SonarQube Servers:** Add URL: `http://<EC2-3-IP>:9000`
- [ ] **Email Notifications:** Configure SMTP (optional)

---

## 🔐 Phase 2: Setup Credentials

**Path:** Manage Jenkins → Credentials → System → Global credentials

### Credential 1: GitHub Token (ID: `github-token`)
```
Kind: Username with password
Scope: Global
Username: SQUADRON-LEADER
Password: ghp_xxxxxxxxxxxx (GitHub Personal Access Token)
Description: GitHub Repository Access
```

**How to generate GitHub token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Scopes: `repo`, `admin:repo_hook`, `admin:org_hook`
4. Copy token immediately

### Credential 2: SonarQube Token (ID: `sonar-auth-token`)
```
Kind: Secret text
Scope: Global
Secret: squ_xxxxxxxxxxxxx (SonarQube Project Token)
Description: SonarQube Project Authentication
```

**How to generate SonarQube token:**
1. SonarQube UI → Administration → Security → Users
2. Create user "jenkins" with password
3. Click user → Tokens → Generate
4. Copy token

### Credential 3: AWS ECR Credentials (ID: `aws-ecr-creds`)
```
Kind: Username with password
Scope: Global
Username: AWS
Password: AKIA....:wJal... (AWS Access Key:Secret Key)
Description: AWS ECR Docker Registry Access
```

**How to create AWS credentials:**
1. AWS Console → IAM → Users → Create User "jenkins-ecr"
2. Attach policy: `AmazonEC2ContainerRegistryFullAccess`
3. Create access key
4. Copy Access Key ID and Secret Access Key

### Credential 4: Kubeconfig (ID: `kubeconfig-credentials`)
```
Kind: Secret file
Scope: Global
File: ~/.kube/config (from Kubernetes master)
Description: Kubernetes Cluster Authentication
```

**How to get kubeconfig:**
1. From K8s master: `cat ~/.kube/config`
2. Copy entire content
3. Save to local file
4. Upload as Secret file credential

### Credential 5: AWS Account ID (ID: `aws-account-id`)
```
Kind: Secret text
Scope: Global
Secret: 123456789012 (Your AWS Account ID)
Description: AWS Account Identifier
```

---

## 🚀 Phase 3: Configure GitHub Webhook

### Step 3.1: Get Jenkins Public IP
```bash
# On EC2-1
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

### Step 3.2: Configure GitHub Webhook
1. GitHub Repo → Settings → Webhooks → Add webhook
2. **Payload URL:** `http://<JENKINS-IP>:8080/github-webhook/`
3. **Content type:** `application/json`
4. **Events:**
   - [ ] Push events
   - [ ] Pull request events
5. Click **"Add webhook"**

### Step 3.3: Test Webhook
GitHub should show ✅ "Recent Deliveries" with status 200

---

## 💼 Phase 4: Create Jenkins Pipeline Job

### Step 4.1: Create New Pipeline Job
1. Jenkins Dashboard → New Item
2. **Job name:** `veltrix-main`
3. **Type:** Pipeline
4. Click OK

### Step 4.2: Configure Pipeline

**General Tab:**
- [ ] Description: "Veltrix Main Branch CI/CD Pipeline"
- [ ] GitHub project URL: `https://github.com/SQUADRON-LEADER/Veltrix`
- [ ] Discard old builds: 30 days, max 20

**Build Triggers Tab:**
- [ ] Check "GitHub hook trigger for GITScm polling"

**Pipeline Tab:**
- [ ] Definition: **Pipeline script from SCM**
- [ ] SCM: Git
- [ ] Repository URL: `https://github.com/SQUADRON-LEADER/Veltrix.git`
- [ ] Credentials: Select `github-token`
- [ ] Branch: `*/main`
- [ ] Script path: `Jenkinsfile`
- [ ] Lightweight checkout: ✓ (checked)

Click **Save**

---

## 🧪 Phase 5: Run Pipeline End-to-End

### Step 5.1: Trigger Pipeline Manually (First Time)
1. Jenkins Dashboard → Select `veltrix-main`
2. Click **"Build Now"**
3. Monitor build progress in console

**Expected Stages:**
1. ✓ Checkout Source
2. ✓ Install & Unit Test
3. ✓ SonarQube Code Quality Scan
4. ✓ SonarQube Quality Gate Check
5. ✓ Build Docker Images
6. ✓ Push Images to Amazon ECR
7. ✓ Deploy to Kubernetes (Green Namespace)

### Step 5.2: Test Webhook Trigger
1. Make a small code change locally:
```bash
echo "# Updated" >> README.md
git add README.md
git commit -m "Test Jenkins webhook trigger"
git push origin main
```

2. GitHub webhook should automatically trigger Jenkins build
3. Monitor at Jenkins Dashboard → veltrix-main → Build History

### Step 5.3: Verify Deployment
```bash
# Check K8s deployment
kubectl get pods -n green
kubectl get svc -n green
kubectl logs deployment/veltrix-backend -n green

# Check service endpoint
kubectl get svc veltrix-service -n green
# Access: http://<EXTERNAL-IP>
```

---

## ✅ Verification Checklist

- [ ] Jenkins is running and accessible at `http://<EC2-1-IP>:8080`
- [ ] All 5 credentials are configured
- [ ] GitHub webhook shows successful deliveries
- [ ] Pipeline job `veltrix-main` exists and can be triggered
- [ ] All 7 pipeline stages complete successfully
- [ ] Docker images are pushed to ECR with correct tags
- [ ] K8s deployment in `green` namespace has running pods
- [ ] Service selector points to `env: green`
- [ ] Application is accessible via LoadBalancer endpoint

---

## 🐛 Troubleshooting

### Issue: Jenkins Build Fails at Docker Build Stage
**Solution:**
```bash
# Verify Docker is installed on Jenkins
sudo apt-get install -y docker.io
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue: ECR Push Fails (Unauthorized)
**Solution:**
```bash
# Verify AWS credentials are correct
aws ecr get-login-password --region us-east-1
# Re-create credential with correct format: AKIA....:wJal...
```

### Issue: K8s Deployment Fails
**Solution:**
```bash
# Verify kubeconfig
kubectl cluster-info --kubeconfig=/path/to/kubeconfig
# Test credentials on Jenkins server
```

### Issue: Quality Gate Fails
**Solution:**
1. Check SonarQube quality gate settings
2. Set reasonable thresholds: No blocker bugs, 0 critical vulnerabilities
3. Review scan results in SonarQube UI

---

## 📊 Success Indicators

✅ **Module 2 is complete when:**
1. Jenkins pipeline runs end-to-end without errors
2. Docker images are built and tagged correctly
3. Images are pushed to AWS ECR successfully
4. Kubernetes deployment in green namespace is running
5. Service LoadBalancer is accessible
6. Git push to main automatically triggers pipeline
7. All 7 stages complete in ~10 minutes

---

## 📹 Video Demo Script (V1 — 5 minutes)

**Title:** "Jenkins Full Pipeline — From Git Push to Live App on Kubernetes"

```
[0:00] Start recording on Jenkins Dashboard
[0:05] Show GitHub repo, make small code change
[0:10] Commit and push code to main branch
[0:15] GitHub webhook delivers to Jenkins
[0:20] Jenkins build starts, show console logs
[0:45] Stage 1: Git Checkout ✓
[1:00] Stage 2: npm test ✓
[1:30] Stage 3: SonarQube Scan ✓
[2:00] Stage 4: Quality Gate ✓
[2:15] Stage 5: Docker Build ✓
[3:00] Stage 6: ECR Push ✓
[3:30] Stage 7: K8s Deploy ✓
[4:00] Show K8s pods running: kubectl get pods -n green
[4:15] Show LoadBalancer endpoint: kubectl get svc -n green
[4:30] Curl/Browser to service endpoint → App is live!
[4:45] Conclusion: Full CI/CD pipeline successful
[5:00] End
```

---
