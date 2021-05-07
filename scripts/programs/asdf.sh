#!/bin/bash

figlet Installing asdf | lolcat
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.8.0

. $HOME/.asdf/asdf.sh

# Install nodejs with asdf
figlet Installing NodeJS | lolcat
asdf plugin add nodejs
asdf install nodejs latest:lts
asdf global nodejs lts

# Install yarn with asdf
figlet Installing Yarn | lolcat
asdf plugin-add yarn 
asdf install yarn 1.22.10
asdf global yarn 1.22.10