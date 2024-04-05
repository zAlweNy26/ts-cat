import { z } from 'zod'
import { CatForm } from '@form'
import { CatTool } from '@tool'

CatTool.add('GetTime', 'Useful to get the current time when asked. Input is always null.', async () => {
	return new Date().toLocaleString()
}, {
	direct: true,
	examples: ['What time is it', 'Get the time'],
})

CatTool.add('GetName', 'Useful to get the current user name when asked. Input is the user name.', async (input) => {
	return `Your name is ${input}`
}, {
	examples: ['My name is Daniele', 'I\'m John'],
})

CatForm.add('PizzaForm', {
	pizza: z.string(),
	size: z.enum(['small', 'medium', 'large']),
}, async ({ pizza, size }) => {
	console.log(`Pizza form submitted succesfully with output:`)
	console.log(`Pizza: ${pizza} | Size: ${size}`)
}, {
	description: 'Useful when you want to order a pizza.',
	startExamples: ['I want to order a pizza', 'Order a pizza'],
})
