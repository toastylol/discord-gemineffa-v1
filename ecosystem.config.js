// pm2 ecosystem config file, make changes as needed

module.exports = {
  apps: [{
    name: "ineffa",
    script: "./gemineffa.js",
    watch: false,
    kill_timeout: 3000,
    wait_ready: true,
    listen_timeout: 3000,
    
    autorestart: true,
    max_restarts: 10,
    restart_delay: 4000,
    
    max_memory_restart: "200M",
    
    out_file: "./logs/out.log",
    error_file: "./logs/error.log",
    merge_logs: true,
    log_date_format: "DD-MM-YYYY HH:mm:ss",

    env: {
      NODE_ENV: "production",
    }
  }]
}