#!/bin/bash

# Up from scripts dir
cd ..

# remove files if already exists
rm -rf "$(pwd)/.gitconfig" "$(pwd)/.zshrc" "$(pwd)/.bashrc"

# copy dot folders
cp -r .config ${HOME}
cp -r .fonts ${HOME}

# create link for dotfiles
ln -s "$(pwd)/.gitconfig" ~/.gitconfig
ln -s "$(pwd)/.zshrc" ~/.zshrc
ln -s "$(pwd)/.bashrc" ~/.bashrc
