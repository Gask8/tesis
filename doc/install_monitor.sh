#https://testriq.com/blog/post/how-to-simulate-real-user-traffic-in-performance-testing
#https://grafana.com/blog/2024/03/13/an-opentelemetry-backend-in-a-docker-image-introducing-grafana/otel-lgtm/

sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

sudo systemctl start docker
sudo systemctl enable docker

sudo usermod -a -G docker ubuntu
newgrp docker
docker --version
docker-compose --version

#https://grafana.com/blog/2024/03/13/an-opentelemetry-backend-in-a-docker-image-introducing-grafana/otel-lgtm/

#Install Prometeus and grafana
#https://signoz.io/guides/how-to-install-prometheus-and-grafana-on-docker/
docker network create monitoring
echo -e "global:\n  scrape_interval: 15s\n\nscrape_configs:\n  - job_name: 'prometheus'\n    static_configs:\n      - targets: ['localhost:9090']" > prometheus.yml
sudo bash -c "cat << 'EOF' > docker-compose.yml
version: '3'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - 9090:9090
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - monitoring

  grafana:
    image: grafana/grafana
    ports:
      - 3000:3000
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=gabo
    networks:
      - monitoring

networks:
  monitoring:
    external: true
EOF"
docker-compose up -d
docker ps
# on prometheus.yml:
# docker-compose restart prometheus

# global:
#   scrape_interval: 15s

# scrape_configs:
#   - job_name: 'prometheus'
#     scrape_interval: 5s
#     static_configs:
#     - targets: ['localhost:9090']

#   - job_name: 'node_app'
#     scrape_interval: 5s
#     static_configs:
#     - targets: ['172.31.13.54:9100']