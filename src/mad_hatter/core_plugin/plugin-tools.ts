import { z } from 'zod'
import { CatForm } from '@form'
import { CatTool } from '@tool'

CatTool.add('GetTime', 'Useful to get the current time when asked. Input is always null.', async () => {
	return new Date().toLocaleString()
}, {
	direct: true,
	startExamples: ['What time is it', 'Get the time'],
})

CatTool.add('GetName', 'Useful to get the current user name when asked. Input is the user name.', async (input) => {
	return `Your name is ${input}`
}, {
	startExamples: ['My name is Daniel', 'I\'m John'],
})

CatForm.add('PizzaForm', {
	pizza: z.string().describe('The pizza you want to order'),
	size: z.enum(['small', 'medium', 'large']).describe('The size of the pizza'),
}, {
	description: 'Useful when you want to order a pizza.',
	startExamples: ['I want to order a pizza', 'Order a pizza'],
	async onSubmit({ pizza, size }) {
		console.log(`Pizza: ${pizza} | Size: ${size}`)
		return {
			output: 'Pizza form submitted successfully!',
		}
	},
})
