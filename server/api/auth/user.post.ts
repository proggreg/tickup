export default defineEventHandler(async (event) => {
    
    const body = await readBody(event)
    console.log('body', body)
    // console.log('header here', event.headers)
      // const headers = useRequestHeaders(['cookie']) as HeadersInit

      if (!body.username) {
        return 'no username'
      }
      console.log('find user ', body.username)
      const user = await UserSchema.find({ username: body.username})
      console.log('user ', user)
      if (user.length) {
        return 'username taken'
      }

      
      const newUser = await new UserSchema(body).save()

      return newUser


      
  // console.log('headers', headers.cookie)
  // const sessionTokenRegex = /next-auth\.session-token=([^;]+)/;

  // Use the regular expression to extract the session token
  // const match = headers.cookie.match(sessionTokenRegex);

  // Check if a match is found and get the session token
  // const sessionToken = match ? match[1] : null;
  // console.log('here', sessionToken)

    // const session = await getServerSession(event)
    // console.log('here session', session)

    return 'here'
 
})