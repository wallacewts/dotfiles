#!/bin/bash

# Update Ubuntu and get standard repository programs
sudo apt update && sudo apt full-upgrade -y

function install {
  which $1 &> /dev/null

  if [ $? -ne 0 ]; then
    echo "Installing: ${1}..."
    sudo apt install -y $1
  else
    echo "Already installed: ${1}"
  fi
}

# Basics
install curl
install git
install openvpn
install vim
install snap

# Image processing
install gimp
install jpegoptim
install optipng

# Fun stuff
install figlet
install lolcat

# Run all scripts in programs/
for f in programs/*.sh; do bash "$f" -H; done

# Copy dotfiles
./copy.sh $1

# Get all upgrades
sudo apt upgrade -y
sudo apt autoremove -y

# Fun finish message
figlet Finish installation | lolcat

./create-docker-group.sh
