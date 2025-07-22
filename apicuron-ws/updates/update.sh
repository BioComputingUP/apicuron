#@IgnoreInspection BashAddShebang
#$ -S /bin/bash
#$ -cwd
#$ -o /var/local/webservers/apps/apicuron/updates/apicuron-update.o
#$ -e /var/local/webservers/apps/apicuron/updates/apicuron-update.e
#$ -m e
#$ -M biocomp-tech@bio.unipd.it,adel.bouhraoua@unipd.it

echo -e "$(date -R)\tStarted APICURON update scripts"

#echo -e "$(date -R)\t  executing reporting_disprot_ped.py ..."
#module load python
#python reporting_disprot_ped.py >reporting_disprot_ped.log 2>&1
#ex=$?
#if [ $ex -ne 0 ]; then
#  echo "Error running reporting_disprot_ped.py ($ex), aborting!"|tee /dev/stderr
#  exit 1
#fi
#
echo -en "$(date -R)\t  waiting APICURON for ORCID update ... "
curlresult="\"updating\""
while [ "$curlresult" != "\"ready\"" ]; do
  curlresult=$(curl -s 'https://apicuron.org/api/orcid_update' 2>&1)
  echo -n "."
  sleep 1
  if [ "$curlresult" != "\"updating\"" ] && [ "$curlresult" != "\"ready\"" ]; then
    echo -e "\n$curlresult"
    echo "Error checking for ORCID update, aborting!"|tee /dev/stderr
    exit 1
  fi
done
echo

# old update script
# echo -e "$(date -R)\t  loading new curation data from Disprot"
# module load python3/3.8.5
# python3 update_disprot.py >> apicuron_disprot_update.log 2>&1
# ex=$?
# if [ $ex -ne 0 ]; then
#   echo "Error executing update_disprot.py ($ex), aborting!"|tee /dev/stderr
#   exit 1
# fi

echo -e "$(date -R)\t  Executing Routine Database tasks"
module load python3/3.8.5
echo "Loading Data from Disprot"
python3 apicuron-tasks/main.py --host moros -db apicuron -t disprot_update  >> apicuron_disprot_update.log 2>&1

echo "Computing Achievements"
python3 apicuron-tasks/main.py --host moros -db apicuron -t compute_achievements -a disprot

echo "Computing User statistics"
python3 apicuron-tasks/main.py --host moros -db apicuron -t compute_statistics -a disprot
ex=$?
if [ $ex -ne 0 ]; then
  echo "Error executing update_disprot.py ($ex), aborting!"|tee /dev/stderr
  exit 1
fi


# echo -e "$(date -R)\t  executing aggregate_achievements.js ..."
# mongo "mongodb://172.21.2.81:27017/apicuron" aggregate_achievements.js >aggregate_achievements.log 2>&1
# ex=$?
# if [ $ex -ne 0 ]; then
#   echo "Error executing aggregate_achievements.js ($ex), aborting!"|tee /dev/stderr
#   exit 1
# fi

# echo -e "$(date -R)\tDone with APICURON update scripts, exiting."
