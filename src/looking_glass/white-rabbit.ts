import { log } from '@logger'
import { Cron } from 'croner'

type CronPiece = number | `*` | `?`

type CronPattern = `${CronPiece} ${CronPiece} ${CronPiece} ${CronPiece} ${CronPiece}`
	| `@yearly` | `@monthly` | `@weekly` | `@daily` | `@hourly`

interface CronOptions {
	instant?: boolean
	onError?: (e: unknown) => any
	timezone?: `${string}/${string}`
	maxRuns?: number
}

interface CronJob {
	pattern: string | Date | null
	status: 'running' | 'paused' | 'stopped'
	nextRun: Date | null
	previousRun: Date | null
}

/**
 * I'm late, I'm late, for a very important date!
 */
export class WhiteRabbit {
	private static instance: WhiteRabbit
	private jobs = new Map<string, Cron>()

	private constructor() {
		log.silent('Initializing the White Rabbit...')
	}

	/**
	 * Get the White Rabbit instance
	 * @returns The White Rabbit class as a singleton
	 */
	static async getInstance() {
		if (!WhiteRabbit.instance) WhiteRabbit.instance = new WhiteRabbit()
		return WhiteRabbit.instance
	}

	/**
	 * Retrieve the current scheduled jobs
	 * @returns An array of jobs
	 */
	getJobs() {
		return [...this.jobs.entries()].reduce((acc, [name, job]) => {
			acc[name] = {
				pattern: job.getPattern() || job.currentRun(),
				status: job.isRunning() ? 'running' : (job.isStopped() ? 'stopped' : 'paused'),
				nextRun: job.nextRun(),
				previousRun: job.previousRun(),
			}
			return acc
		}, {} as Record<string, CronJob>)
	}

	/**
	 * Pause a scheduled job
	 * @param name The name assigned to the job
	 * @returns A boolean indicating if the job was successfully paused
	 */
	pauseJob(name: string) {
		return this.jobs.get(name)?.pause()
	}

	/**
	 * Resume a paused job
	 * @param name The name assigned to the job
	 * @returns A boolean indicating if the job was successfully resumed
	 */
	resumeJob(name: string) {
		return this.jobs.get(name)?.resume()
	}

	/**
	 * Removes a scheduled job
	 * @param name The name assigned to the job
	 * @returns A boolean indicating if the job was successfully removed
	 */
	removeJob(name: string) {
		this.jobs.get(name)?.stop()
		return this.jobs.delete(name)
	}

	/**
	 * Schedule a new job
	 * @param name The name to assign to the job
	 * @param pattern The cron pattern to use
	 * @param job The function to run
	 * @param options Additional options
	 */
	scheduleJob(name: string, pattern: Date | CronPattern, job: () => void | Promise<void>, options?: CronOptions) {
		const { instant, maxRuns, timezone, onError } = options ?? {}
		const schedule = new Cron(pattern, job, {
			name,
			catch: onError,
			paused: !instant,
			maxRuns,
			timezone,
		})
		this.jobs.set(name, schedule)
		log.info(schedule)
	}
}

/**
 * I'm late, I'm late, for a very important date!
 */
export const whiteRabbit = await WhiteRabbit.getInstance()
