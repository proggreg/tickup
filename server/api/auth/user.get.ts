import { getServerSession } from "#auth"



export default defineEventHandler(async (event) => {
    // console.log('params', event.context.params)
    // console.log('header here', event.headers)
      // const headers = useRequestHeaders(['cookie']) as HeadersInit

  // console.log('headers', headers.cookie)
  // const sessionTokenRegex = /next-auth\.session-token=([^;]+)/;

  // Use the regular expression to extract the session token
  // const match = headers.cookie.match(sessionTokenRegex);

  // Check if a match is found and get the session token
  // const sessionToken = match ? match[1] : null;
  // console.log('here', sessionToken)

    // const session = await getServerSession(event)
    // console.log('here session', session)
 return await SessionSchema.find()    
})