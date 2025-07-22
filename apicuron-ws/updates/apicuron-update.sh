#!/bin/sh

log=$(basename "$0" .sh).log

# test wdir, should be .../updates
wd="$( cd "$( dirname "$0" )" && pwd )"
if [ "$(basename "$wd")" != "updates" ]; then
    echo -e "$(date -R)\tError reading cwd ($wd), should be updates, aborting!" |tee -a $log
    exit 1
fi

# move to work dir if called from script
if ! cd "$wd" ; then
    echo -e "$(date -R)\tError changing dir to \"$wd\", aborting!" |tee -a $log
    exit 1
fi

echo -e "$(date -R)\tStarting APICURON update ..." |tee -a $log

# submit update.sh as nodejs@urano
echo -e "$(date -R)\t  Submitting update.sh as nodejs on bigmem queue ..." |tee -a $log
#chmod 400 id_rsa_nodejs
qsublog=$(ssh nodejs@urano -o StrictHostKeyChecking=no "cd /var/local/webservers/apps/apicuron/updates/;qsub -q bigmem -N apicuron-update update.sh" 2>&1)
ex=$?
echo -e "$(date -R)\t  qsub ($ex): $(echo $qsublog|tr -d '\r'|tr '\n' '|'|sed 's/|$//')" |tee -a $log
echo -e "$(date -R)\t  Submitted, check apicuron-update.{o,e,log} for progress." |tee -a $log

echo -e "$(date -R)\tDone with APICURON update, exiting." |tee -a $log
exit 0
