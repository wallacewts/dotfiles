#!/bin/bash

figlet Installing ZSH | lolcat
sudo apt install -y zsh
chsh -s $(which zsh)
sudo /bin/zsh -c "sh -c '$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)' '' --unattended"

figlet Installing spaceship theme | lolcat
sudo /bin/zsh -c "git clone https://github.com/denysdovhan/spaceship-prompt.git '$ZSH_CUSTOM/themes/spaceship-prompt'"
sudo /bin/zsh -c "ln -s '$ZSH_CUSTOM/themes/spaceship-prompt/spaceship.zsh-theme' '$ZSH_CUSTOM/themes/spaceship.zsh-theme'"
sudo /bin/zsh -c "sh -c '$(curl -fsSL https://raw.githubusercontent.com/zdharma/zinit/master/doc/install.sh)'"
