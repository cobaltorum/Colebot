type Env = {
	BOT_TOKEN: string;
	BOT_ID: string;
	DEVELOPER_ID: string;
	VIRUSTOTAL_API_KEY: string | undefined;
};

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Env {}
	}
}
