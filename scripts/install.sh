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
./copy.sh

# Reload configurations
source .zshrc

# Install nodejs with asdf
figlet Installing NodeJS | lolcat
asdf plugin-add nodejs
asdf install nodejs latest:lts
asdf global nodejs lts

# Get all upgrades
sudo apt upgrade -y
sudo apt autoremove -y

# Fun hello
figlet Finish installation | lolcat

