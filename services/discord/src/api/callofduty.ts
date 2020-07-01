import * as Mongo from '@stagg/mongo'
import { Mongo as MongoAPI } from '.'
import { T as API } from '@stagg/api'

export enum CreatePlayerRes {
    NewlyCreated,
    AlreadyExists,
}
export const CreatePlayer = async (email:string, auth:API.CallOfDuty.Tokens):Promise<CreatePlayerRes> => {
    // const emailExists = 
    return CreatePlayerRes.AlreadyExists
}