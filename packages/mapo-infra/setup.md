# Setup

These steps have to be done manually once for each VM


1. Update sources.list
    ```
    echo "" > /etc/apt/sources.list

    echo "deb http://deb.debian.org/debian bookworm main non-free-firmware" >> /etc/apt/sources.list
    echo "deb-src http://deb.debian.org/debian bookworm main non-free-firmware" >> /etc/apt/sources.list
    echo "deb http://deb.debian.org/debian-security/ bookworm-security main non-free-firmware" >> /etc/apt/sources.list
    echo "deb-src http://deb.debian.org/debian-security/ bookworm-security main non-free-firmware" >> /etc/apt/sources.list
    echo "deb http://deb.debian.org/debian bookworm-updates main non-free-firmware" >> /etc/apt/sources.list
    echo "deb-src http://deb.debian.org/debian bookworm-updates main non-free-firmware" >> /etc/apt/sources.list

    apt update
    apt upgrade -y
    ```

2. Install Nginx
    ```
    apt install nginx -y
    ```
