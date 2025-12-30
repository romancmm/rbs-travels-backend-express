#!/bin/bash

# Setup monitoring and auto-recovery for RBS Backend

echo "Setting up monitoring and auto-recovery..."

# Make health check script executable
chmod +x /root/apps/rbs-travels-backend-express/scripts/monitor-health.sh

# Create log directory
sudo mkdir -p /var/log
sudo touch /var/log/rbs-health.log
sudo chmod 644 /var/log/rbs-health.log

# Add cron job to run health check every 5 minutes
CRON_JOB="*/5 * * * * /root/apps/rbs-travels-backend-express/scripts/monitor-health.sh"
(crontab -l 2>/dev/null | grep -v "monitor-health.sh"; echo "$CRON_JOB") | crontab -

echo "✓ Health monitoring cron job added"

# Add log rotation to prevent log files from growing too large
cat > /etc/logrotate.d/rbs-health << 'EOF'
/var/log/rbs-health.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
EOF

echo "✓ Log rotation configured"

# Check if swap exists, if not create one (helps with OOM issues)
if [ ! -f /swapfile ]; then
    echo "Creating 2GB swap file to prevent OOM issues..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✓ Swap file created"
else
    echo "✓ Swap file already exists"
fi

echo ""
echo "=== Monitoring Setup Complete ==="
echo "Health checks will run every 5 minutes"
echo "View logs: tail -f /var/log/rbs-health.log"
echo ""
