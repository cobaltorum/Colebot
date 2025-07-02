type Env = {
	BOT_TOKEN: string;
	BOT_ID: string;
	DEFAULT_PREFIX: string;
	DEVELOPER_ID: string;
};

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Env {}
	}
}
