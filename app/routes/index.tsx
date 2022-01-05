import type {LinksFunction, MetaFunction} from 'remix'
import {Link} from 'remix'
import stylesUrl from '~/styles/index.css'

export const links: LinksFunction = () => {
  return [{rel: 'stylesheet', href: stylesUrl}]
}

export const meta: MetaFunction = () => {
  return {
    title: "Remix: So great, it's funny!",
    description: 'Remix jokes app. Learn Remix and laugh at the same time!',
  }
}

// The app/routes/index.tsx is a child of the app/root.tsx route.
// In nested routing, parents are responsible for laying out their children.
export default function Index() {
  return (
    <div className="container">
      <div className="content">
        <h1>
          Remix <span>Jokes!</span>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to="jokes">Read Jokes</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
