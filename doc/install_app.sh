# For App EC2
sudo apt update -y

## Git
sudo apt install git -y
#Instalar SSH para Github
ssh-keygen -t ed25519 -C "gabsalk@amazon.com"
cat ~/.ssh/id_ed25519.pub
git clone git@github.com:gabsalk8/tesis.git

## Postgres
# https://hbayraktar.medium.com/how-to-install-postgresql-15-on-amazon-linux-2023-a-step-by-step-guide-57eebb7ad9fc
sudo apt install postgresql -y
sudo apt install postgresql-client -y
#test connection
#psql -h database-1.c5wm0qy68wtt.us-east-1.rds.amazonaws.com -U postgres -d postgres

## Node with nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 22
node -v # Should print "v22.15.1".
npm -v # Should print "10.9.2".

## Nginx
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
sudo vim /etc/nginx/sites-available/redirect
# server {
#     listen 80;
#     server_name your_domain.com;  # Replace with your domain or IP

#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }
# }
sudo ln -s /etc/nginx/sites-available/redirect /etc/nginx/sites-enabled/
mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/.default
sudo nginx -t
sudo systemctl reload nginx

## app Deamon
npm install -g pm2
pm2 start dist/index.js --name "my-app"
pm2 startup
pm2 save

## DOCKER
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io -y

sudo systemctl start docker
sudo systemctl enable docker

sudo usermod -a -G docker ubuntu
newgrp docker
docker --version

# docker build -t my-app .
# docker run -p 3000:3000 my-app


#POWERTOP
sudo apt-get install powertop