# For App EC2
sudo yum update -y

## Git
sudo yum install git -y
#== Instalar SSH para Github
ssh-keygen -t ed25519 -C "gabsalk@amazon.com"
cat ~/.ssh/id_ed25519.pub

## Postgres
# https://hbayraktar.medium.com/how-to-install-postgresql-15-on-amazon-linux-2023-a-step-by-step-guide-57eebb7ad9fc
sudo yum install postgresql17 -y
#== test connection
#psql -h database-1.c5wm0qy68wtt.us-east-1.rds.amazonaws.com -U postgres -d postgres

## Node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
node -e "console.log('Running Node.js ' + process.version)"

## Nginx
sudo yum install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
#sudo vim /etc/nginx/nginx.conf
# location / {
#     proxy_pass http://localhost:3000;
#     proxy_http_version 1.1;
#     proxy_set_header Upgrade $http_upgrade;
#     proxy_set_header Connection 'upgrade';
#     proxy_set_header Host $host;
#     proxy_cache_bypass $http_upgrade;
# }

sudo nginx -t
sudo systemctl reload nginx

## app Deamon
npm install -g pm2
pm2 start dist/index.js --name "my-app"
pm2 startup
pm2 save


#INSTAL POWERTOP
wget https://cdn.amazonlinux.com/2/core/2.0/x86_64/6b0225ccc542f3834c95733dcf321ab9f1e77e6ca6817469771a8af7c49efe6c/../../../../../blobstore/14d5c54222db927648314d31cefa2cc90109c07bea852b49aef3979ec0ac65de/powertop-2.3-12.amzn2.0.1.x86_64.rpm
sudo rpm -ivh powertop-2.3-12.amzn2.0.1.x86_64.rpm

sudo powertop --html=powerreport.html