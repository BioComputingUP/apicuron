

class User {
    displayedName: string;
    full_name?: string;
    last_update?: string;
	resources?: Array<any>;
    _id?: string;
    orcid_id: string;
    role: "user" | 'admin';
    family_name?: string;
    given_name?: string;



    generate_avatar(){
        const hash = encodeURIComponent(this.displayedName);
        const defaultImage = encodeURIComponent(`https://api.dicebear.com/5.x/identicon/png/seed=${hash}&scale=80&radius=50`);
        return `https://www.gravatar.com/avatar/${hash}?d=${defaultImage}`;
    }
}