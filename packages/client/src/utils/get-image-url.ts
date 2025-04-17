type Data =
  | {
      type: 'capsule'
      capsuleId: string
      imageName: string | undefined
    }
  | { type: 'user'; id: string }
  | { type: 'me' }

export const getImageUrl = (data: Data) => {
  const base = import.meta.env.VITE_SERVER_URL

  switch (data.type) {
    case 'capsule':
      return (
        data.imageName &&
        `${base}/capsules/${data.capsuleId}/images/${data.imageName}`
      )
    case 'user':
      return `${base}/users/${data.id}/image`
    case 'me':
      return `${base}/users/me/image`
  }
}
