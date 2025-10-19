import { User, Role, Permission } from '@prisma/client'

declare global {
 namespace Express {
  interface Request {
   user?: User & {
    role?: Role & {
     permissions?: Permission[]
    }
   }
  }
 }
}
