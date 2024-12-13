import { headerStyles as styles } from '@/components/Admin/Header/headerStyle';

interface HeaderProps {
    onSignOut: () => void;  // Define the type for onSignOut
    onExport: () => void;    // Define the type for onExport
}

const Header = (props: HeaderProps): JSX.Element => {
    const { onSignOut, onExport } = props;

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h2 className={styles.title}>Dashboard</h2>
                
                <div className={styles.buttonContainer}>
                    <button
                        onClick={onExport}
                        className={`${styles.buttonBase} ${styles.exportButton}`}
                    >
                        <svg 
                            className={styles.icon} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        Exportar Datos
                    </button>
                </div>
            </div>
        </div>
    );
};

export { Header };