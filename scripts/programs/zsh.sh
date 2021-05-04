#!/bin/bash

figlet Installing ZSH | lolcat
sudo apt install -y zsh
chsh -s $(which zsh)
/bin/zsh -c "git clone https://github.com/ohmyzsh/ohmyzsh.git ~/.oh-my-zsh"

figlet Installing spaceship theme | lolcat
/bin/zsh -c "git clone https://github.com/denysdovhan/spaceship-prompt.git '$ZSH_CUSTOM/themes/spaceship-prompt'"
/bin/zsh -c "ln -s '$ZSH_CUSTOM/themes/spaceship-prompt/spaceship.zsh-theme' '$ZSH_CUSTOM/themes/spaceship.zsh-theme'"

figlet Installing zinit | lolcat
mkdir ~/.zinit
/bin/zsh -c "git clone https://github.com/zdharma/zinit.git ~/.zinit/bin"
