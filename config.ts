interface FirebaseConfig {
    projectId: string;
    functionUrl: string;
}

interface Config {
    firebase: FirebaseConfig;
}

const config: Config = {
    firebase: {
        projectId: 'cospecreclamos',
        functionUrl: 'https://us-central1-cospecreclamos.cloudfunctions.net/sendClaimNotification'
    }
};

export default config;
