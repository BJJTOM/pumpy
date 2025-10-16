#!/bin/bash
cd /home/ubuntu/pumpy/gym_web/app

echo "Fixing API_BASE references..."

# attendance
sed -i 's/axios.delete(`\${API_BASE}/const apiBase = getApiUrl(); axios.delete(`\${apiBase}/g' attendance/page.tsx

# coaches  
sed -i 's/axios.get(`\${API_BASE}/const apiBase = getApiUrl(); const res = await axios.get(`\${apiBase}/g' coaches/page.tsx
sed -i 's/await axios.post(`\${API_BASE}/const apiBase = getApiUrl(); await axios.post(`\${apiBase}/g' coaches/page.tsx

# lockers
sed -i 's/\${API_BASE}/\${getApiUrl()}/g' lockers/page.tsx

# plans
sed -i 's/\${API_BASE}/\${getApiUrl()}/g' plans/page.tsx

# revenue
sed -i 's/\${API_BASE}/\${getApiUrl()}/g' revenue/page.tsx

# wods
sed -i 's/\${API_BASE}/\${getApiUrl()}/g' wods/page.tsx

echo "Building Next.js..."
cd /home/ubuntu/pumpy/gym_web
npm run build

echo "Restarting services..."
pm2 restart pumpy-web
sudo systemctl restart gunicorn

echo "Done!"


