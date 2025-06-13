#https://grafana.com/docs/k6/latest/set-up/install-k6/

#!/bin/bash
apt update -y
apt upgrade -y
apt install git -y

useradd -m -s /bin/bash ubuntu || true

# Create a temporary file with the crontab entries
cat << 'EOF' > /tmp/crontab_entries
# Low load testing (8,9,16,17)
0 14 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-low.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_low.json
0 15 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-low.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_low.json
0 22 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-low.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_low.json
0 23 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-low.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_low.json

# Peak load testing (12,13)
0 18 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-peak.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_peak.json
0 19 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-peak.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_peak.json

# Mid load testing (10,11,14,15)
0 16 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-mid.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_mid.json
0 17 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-mid.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_mid.json
0 20 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-mid.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_mid.json
0 21 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-mid.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_mid.json
EOF

crontab -u ubuntu /tmp/crontab_entries
rm /tmp/crontab_entries

su - ubuntu << 'EOF'
cd $HOME
git clone https://github.com/gabsalk8/tesis.git
mkdir logs
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
sudo echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
EOF


# crontab -e
# # Low load testing (8,9,16,17)
# 0 8 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-low.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_low.json
# 0 9 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-low.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_low.json
# 0 16 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-low.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_low.json
# 0 17 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-low.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_low.json

# # Peak load testing (12,13)
# 0 12 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-peak.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_peak.json
# 0 13 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-peak.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_peak.json

# # Mid load testing (10,11,14,15)
# 0 10 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-mid.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_mid.json
# 0 11 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-mid.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_mid.json
# 0 14 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-mid.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_mid.json
# 0 15 * * * cd /home/ubuntu && k6 run tesis/load_testing/loadtest-mid.js --out json=logs/test$(date +\%Y\%m\%d_\%H\%M\%S)_mid.json


#https://medium.com/swlh/beginners-guide-to-load-testing-with-k6-85ec614d2f0d