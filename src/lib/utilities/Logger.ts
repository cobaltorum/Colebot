export default class Logger {
	/**
	 * Log with a custom level, message, and color.
	 *
	 * @param level The log level.
	 * @param message The message to log.
	 * @param options Optional color options.
	 */

	static custom(level: string, message: string, options?: ColorOptions): void {
		const timestamp = new Date().toISOString();
		const timestampString = `${LogColor.Grey}[${timestamp}]${LogColor.Reset}`;

		if (options?.color && !options.full) {
			console.log(`${timestampString} ${LogColor[options.color]}[${level}]${LogColor.Reset} ${message}`);
		} else if (options?.color && options.full) {
			console.log(`${timestampString} ${LogColor[options.color]}[${level}] ${message}${LogColor.Reset}`);
		} else {
			console.log(`${timestampString} $[${level}] ${message}`);
		}
	}

	/**
	 * Logs a message with the INFO level.
	 */

	static info(...values: readonly unknown[]): void {
		this._log(LogLevel.Info, ...values);
	}

	/**
	 * Logs a message with the WARN level.
	 */

	static warn(...values: readonly unknown[]): void {
		this._log(LogLevel.Warn, ...values);
	}

	/**
	 * Logs a message with the DEBUG level.
	 */

	static debug(...values: readonly unknown[]): void {
		this._log(LogLevel.Debug, ...values);
	}

	/**
	 * Logs a message with the ERROR level.
	 */

	static error(...values: readonly unknown[]): void {
		this._log(LogLevel.Error, ...values);
	}

	/**
	 * Logs a message with the FATAL level.
	 */

	static fatal(...values: readonly unknown[]): void {
		this._log(LogLevel.Fatal, ...values);
	}

	/**
	 * Logs a message with the success level.
	 */

	static success(...values: readonly unknown[]): void {
		this._log(LogLevel.Success, LogColor.Green, ...values);
	}

	/**
	 * Logs values to the console with a specific level.
	 *
	 * @param level The log level.
	 * @param values The values to log.
	 */

	private static _log(level: LogLevel, ...values: readonly unknown[]): void {
		const timestamp = new Date().toISOString();
		const timestampString = `${LogColor.Grey}[${timestamp}]${LogColor.Reset}`;

		const levelStr = `${this._getColor(level)}[${level}]${LogColor.Reset}`;

		console.log(`${timestampString} ${levelStr}`, ...(values.length ? values : []));
	}

	/**
	 * Gets the color for a specific log level.
	 *
	 * @param level The log level.
	 * @returns The color for the log level.
	 */

	private static _getColor(level: LogLevel): LogColor | null {
		switch (level) {
			case LogLevel.Info:
				return LogColor.Cyan;
			case LogLevel.Warn:
				return LogColor.Yellow;
			case LogLevel.Debug:
				return LogColor.Orange;
			case LogLevel.Error:
			case LogLevel.Fatal:
				return LogColor.Red;
			case LogLevel.Success:
				return LogColor.Green;
		}
	}
}

export const LogColor = {
	Purple: "\x1b[35m",
	Green: "\x1b[32m",
	Orange: "\x1b[38;5;208m",
	Yellow: "\x1b[33m",
	Reset: "\x1b[0m",
	Cyan: "\x1b[36m",
	Grey: "\x1b[90m",
	Red: "\x1b[31m"
} as const;
type LogColor = (typeof LogColor)[keyof typeof LogColor];

export const LogLevel = {
	Info: "INFO",
	Warn: "WARN",
	Debug: "DEBUG",
	Error: "ERROR",
	Fatal: "FATAL",
	Success: "SUCCESS"
} as const;
type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

interface ColorOptions {
	color?: keyof typeof LogColor;
	full?: boolean;
}
