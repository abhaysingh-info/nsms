import { IRoles } from './user'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'

type IRoleExtended = IRoles | undefined

export interface ILink {
	icon?: any
	title: string
	link: string
	forLoggedIn: boolean | 'both'
	hidden?: boolean
	isBtn?: boolean
	isBtnHighlight?: boolean
	forRoles: IRoleExtended[]
}

export interface ILinkCategory {
	category: string
	link: ILink
}

export type UnAuthTypes = 'blocked' | 'suspended'

export type IFieldType =
	| 'string'
	| 'number'
	| 'number_controls'
	| 'boolean'
	| 'select'

export interface IGenerateField {
	propertyProfileKey: string
	fieldControlName: string
	title: string
	fieldType: IFieldType
	class?: string
}

export interface IIconCard {
	icon: IconDefinition
	title: string
	description: string
}
