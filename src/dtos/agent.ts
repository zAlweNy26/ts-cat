/**
 * The context input for the agent.
 */
export interface ContextInput {
	input: string
	chat_history: string
	episodic_memory: string
	declarative_memory: string
	tools_output: string
	[key: string]: string
}

/**
 * The intermediate step of the agent.
 */
export interface IntermediateStep {
	procedure: string
	input: string | null
	observation: string
}

/**
 * The agent reply configuration.
 */
export interface AgentFastReply {
	output: string
	returnDirect?: boolean
	intermediateSteps?: IntermediateStep[]
}

export type InstantToolTrigger = `${string}{name}${string}`
