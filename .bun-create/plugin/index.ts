import { CatHook } from '@hook'
import { CatPlugin } from '@plugin'
import { CatTool } from '@tool'

CatTool.add('GetInfo', 'Useful to get the current info of the talking user. Input is always null.', async (_input, cat) => {
	return `Your user id is ${cat.userId}`
}, {
	direct: true,
	startExamples: ['Get my info', 'What is my info'],
})

CatHook.add('beforeReadMessage', msg => msg)

CatHook.add('beforeSendMessage', msg => msg)

CatPlugin.on('installed', () => console.log('Plugin installed event executed'))

CatPlugin.on('removed', () => console.log('Plugin removed event executed'))
