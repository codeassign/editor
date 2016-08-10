#!/bin/bash
USER=deploy
HOST=codeassign.com
LOCATION=/home/$USER/www/editor/

ssh $USER@$HOST "cd $LOCATION && rm -rf *"
scp -r [!deploy.sh]* $USER@$HOST:$LOCATION
