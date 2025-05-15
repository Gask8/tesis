# https://rohan-j-tiwari.medium.com/prometheus-installation-on-amazon-ec2-and-monitor-other-server-metric-into-prometheus-and-visualize-c2e5cf4bf977

sudo su
useradd -m -s /bin/bash monitoring
cd /home/monitoring

wget https://github.com/prometheus/node_exporter/releases/download/v1.2.2/node_exporter-1.2.2.linux-amd64.tar.gz
tar -xzvf node_exporter-1.2.2.linux-amd64.tar.gz
rm -rf node_exporter-1.2.2.linux-amd64.tar.gz
mv node_exporter-1.2.2.linux-amd64 /home/monitoring/node_exporter
chown -R monitoring:monitoring /home/monitoring/node_exporter
vi /etc/systemd/system/node_exporter.service

# [Unit]
# Description=Node Exporter
# Wants=network-online.target
# After=network-online.target
# [Service]
# User=monitoring
# ExecStart=/home/monitoring/node_exporter
# [Install]
# WantedBy=default.target


systemctl daemon-reload
systemctl start node_exporter
systemctl enable node_exporter
systemctl status node_exporter

