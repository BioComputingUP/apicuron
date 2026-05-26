#!/bin/bash

# --- Configuration ---

# Source MongoDB details
SOURCE_HOST_DEFAULT="moros"
SOURCE_PORT_DEFAULT="27017" # Default MongoDB port
SOURCE_DB_NAME_DEFAULT="apicuron"
SOURCE_USER_DEFAULT="" # Optional, leave empty if no authentication
SOURCE_PASS_DEFAULT="" # Optional, leave empty if no authentication

# Destination MongoDB details
DEST_HOST_DEFAULT="ermes2"
DEST_PORT_DEFAULT="27017"           # Default MongoDB port
DEST_DB_NAME_DEFAULT="apicuron" # Can be the same as SOURCE_DB_NAME or different
DEST_USER_DEFAULT="apicuron"                # Optional, leave empty if no authentication
DEST_PASS_DEFAULT=""                # Optional, leave empty if no authentication

MAX_DIR_DEPTH=2

# Current Directory of the Script
SCRIPT_DIR="$(realpath $(dirname "$0") )"



#  --- Utility Functions ---

# Function to prompt for input with a default value
# Usage: prompt_default VAR_NAME "Prompt text" "default_value"
prompt_default() {
    local -n var_ref=$1   # Nameref to the variable passed in
    local prompt_text=$2
    local default_val=$3

    # Display prompt as: Prompt text [default_value]: 
    read -rp "$prompt_text [$default_val]: " user_input

    # If user pressed enter without typing, use the default
    var_ref="${user_input:-$default_val}"
}

# Print a bunch of vars together
print_vars() {
    local group_name=$1
    shift # Remove the group name, leaving only the variable names
    
    echo "$group_name = {"
    
    # Loop through all the variable names passed to the function
    for var_name in "$@"; do
        # Use Bash indirect expansion to get the VALUE of the variable name
        local var_val="${!var_name}"
        
        echo "    '$var_name': '$var_val',"
    done
    
    echo "}"
}

# Gather Source DB data info:
SOURCE_HOST=""
prompt_default SOURCE_HOST "Enter the SOURCE_HOST" $SOURCE_HOST_DEFAULT

SOURCE_PORT=""
prompt_default SOURCE_PORT "Enter the SOURCE_PORT" $SOURCE_PORT_DEFAULT
SOURCE_DB_NAME=""
prompt_default SOURCE_DB_NAME "Enter the SOURCE_DB_NAME" $SOURCE_DB_NAME_DEFAULT
SOURCE_USER=""
prompt_default SOURCE_USER "Enter the SOURCE_USER" $SOURCE_USER_DEFAULT
SOURCE_PASS=""
prompt_default SOURCE_PASS "Enter the SOURCE_PASS" $SOURCE_PASS_DEFAULT

print_vars "Source_db_info" SOURCE_HOST SOURCE_PORT SOURCE_DB_NAME SOURCE_USER SOURCE_PASS

# Gather DEST DB data info:

DEST_HOST=""
prompt_default DEST_HOST "Source db host: " $DEST_HOST_DEFAULT

DEST_PORT=""
prompt_default DEST_PORT "Enter the DEST_PORT" $DEST_PORT_DEFAULT
DEST_DB_NAME=""
prompt_default DEST_DB_NAME "Enter the DEST_DB_NAME" $DEST_DB_NAME_DEFAULT
DEST_USER=""
prompt_default DEST_USER "Enter the DEST_USER" $DEST_USER_DEFAULT
DEST_PASS=""
prompt_default DEST_PASS "Enter the DEST_PASS" $DEST_PASS_DEFAULT


print_vars "Dest_db_info" DEST_HOST DEST_PORT DEST_DB_NAME DEST_USER DEST_PASS


# Backup location setup
# Backup directory
BACKUP_DIR_DEFAULT="$SCRIPT_DIR/backup" # Temporary directory for storing the dump
BACKUP_DIR=""
prompt_default BACKUP_DIR "Enter the BACKUP_DIR" $BACKUP_DIR_DEFAULT
echo "Using backup Directory: $(realpath $BACKUP_DIR)"


# --- Script Logic ---

echo "--- MongoDB Backup and Restore Script ---"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
if [ $? -ne 0 ]; then
    echo "Error: Could not create backup directory '$BACKUP_DIR'. Exiting."
    exit 1
fi

read -p "Do you want to perform a backup from the source database and dump it locally? (Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then

    echo "1. Performing backup from ${SOURCE_HOST}:${SOURCE_PORT}/${SOURCE_DB_NAME}..."

    DUMP_CMD="mongodump --host ${SOURCE_HOST} --port ${SOURCE_PORT} --db ${SOURCE_DB_NAME} --out ${BACKUP_DIR}"

    if [ -n "$SOURCE_USER" ]; then
        DUMP_CMD="${DUMP_CMD} --username ${SOURCE_USER}"
    fi

    if [ -n "$SOURCE_PASS" ]; then
        DUMP_CMD="${DUMP_CMD} --password ${SOURCE_PASS}"
    fi

    eval "$DUMP_CMD"

    if [ $? -ne 0 ]; then
        echo "Error: mongodump failed. Exiting."
        rm -rf "$BACKUP_DIR" # Clean up on failure
        exit 1
    else
        echo "Backup completed successfully to ${BACKUP_DIR}/${SOURCE_DB_NAME}."
    fi
fi


# Drop destination database before restore
printf "2. Drop Destination before restoring ? (y/n) "
read -n 1 -r REPLY
echo
DROP_OPTION=""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    DROP_OPTION="--drop"
fi

echo "3. Restoring to ${DEST_HOST}:${DEST_PORT}/${DEST_DB_NAME}..."

RESTORE_CMD="mongorestore --host ${DEST_HOST} --port ${DEST_PORT} ${DROP_OPTION} --db ${DEST_DB_NAME} ${BACKUP_DIR}/${SOURCE_DB_NAME}"

if [ -n "$DEST_USER" ]; then
    RESTORE_CMD="${RESTORE_CMD} --username ${DEST_USER}"
fi

if [ -n "$DEST_PASS" ]; then
    RESTORE_CMD="${RESTORE_CMD} --password ${DEST_PASS}"
fi

eval "$RESTORE_CMD"

if [ $? -ne 0 ]; then
    echo "Error: mongorestore failed. Exiting."
    rm -rf "$BACKUP_DIR" # Clean up on failure
    exit 1
fi

echo "Restore completed successfully."

# Clean up the backup directory
# echo "4. Cleaning up backup directory '$BACKUP_DIR'..."
# rm -rf "$BACKUP_DIR"

echo "--- Script Finished ---"
