// 이 파일을 require하는 쪽은 아래처럼 불러야 한다...
// const typeDefs = require('./schemas')

const {
	gql
}= require("apollo-server-express");


const typeDefs = gql`
 
type Query {
	""" 택시 정보 """
	getCarsInfoPaging(
		Search: CarsInput
		Except: CarsInput
		Start: String
		End: String
		Order: String
		First: String
		Offset: String
	):[Cars]

	""" 유저 정보 """
	getUsersInfoPaging(
		Search: UsersInput
		Except: UsersInput
		Start: String
		End: String
		Order: String
		First: String
		Offset: String
	):[Users]

	
	""" 회사별 정보 """
	getOfficeInfoPaging(
		Search: OfficeInput
		Except: OfficeInput
		Start: String
		End: String
		Order: String
		First: String
		Offset: String
	):[Office]

	#이 위로 페이징  아래로는 셀렉

	""" 시간범위 기준 택시 운전사 일한 시간 min max 구분 """
	getDriverWorkMinMax(
		OFFICE_ID: String!
		ST_DTTI : String!
		ED_DTTI : String!
	):[WorkDailySeq]
	
	""" 1분마다 택시 좌표 현재 활동중인사람들 """
	getDriveOneMinInfoByMax(
		OFFICE_ID: String!
	):[DriveOneMinInfo]

	""" 1분마다 택시 좌표 """
	getDriveOneMinInfo(
		OFFICE_ID: String
		ST_DTTI : String!
		ED_DTTI : String!
		CAR_NUM : String
		DRIVER_ID : String
	):[DriveOneMinInfo]

 
	""" 하루 일한 정보 seqence """
	getWorkDailySeq(
		OFFICE_ID: String!
		REPORT_TYPE: String
		ST_DTTI: String
		ED_DTTI : String
		ST_REPORT: String
		ED_REPORT : String
		CAR_NUM : String
		DRIVER_ID : String
		SEQ_GROUP : String
		GROUP_BY : String
		ORDER_BY : String
	):[WorkDailySeq]


	"""   total  """
	getTotalbyDriverId(
		OFFICE_ID: String!
		INPUT_DATA: [inputDriverIDs]
	):[TotalbyDriverId]
}

type Mutation{
	login(
		ID: String!
		PW: String!
	): AuthPayload

 

	""" Office info """
	insertOfficeInfo(
		OFFICE_ID: ID!
		OFFICE_NAME: String
		CEO_NAME: String
		CEO_TEL: String
		FAX : String
		ADDRESS : String
		OFFICE_TYPE : String
		SET_TIME : String
	):ResultsCount

	updateOfficeInfoByOfficeId(
		OFFICE_ID: ID!
		OFFICE_NAME: String
		CEO_NAME: String
		CEO_TEL: String
		FAX : String
		ADDRESS : String
		OFFICE_TYPE : String
		SET_TIME : String
	): ResultsCount
	
	deleteOfficeInfoByOfficeId(
		OFFICE_ID: String!
	): ResultsCount


	""" 마감 정보 넣기 """
	insertClosingDate(
		OFFICE_ID: String!
		SET_TIME: String
		SEQ_GROUP:String!
		REPORT_DATE:String!
		ST_DTTI : String
		ED_DTTI : String
		CAR_NUM : [String]
	):ResultsCount

	updateClosingDate(
		OFFICE_ID: String!
		SEQ_GROUP: String!
		REPORT_DATE: String!
		INPUT_DATA: [inputClosing]
	): ResultsCount
	
	deleteClosingDate(
		NO :[String]
		REPORT_DATE: String!
		OFFICE_ID: String!
		SEQ_GROUP: String!
	): ResultsCount

	""" user info """
	insertUserInfo(
		OFFICE_ID: String!
		ROLES: String!
		ID: String
		PW: String
		ETC: String
		DRIVER_ID: String
		JOB_TYPE: String
		JOB_POSITION: String
		NAME: String
		SSN: String
		TEL: String
		JOB_STATUS: String
		CAR_NUM: String
		JOIN_DTTI: String
		LEAVE_DTTI: String
		ADDRESS : String
		DRIVER_LICENSE_NUM: String
		DRIVER_LICENSE_CREATE: String
		LICENSE_NUM: String
		LICENSE_CREATE: String
	):ResultsCount

	updateUserInfoByNo(
		NO:ID!
		OFFICE_ID: String
		ROLES: String
		ID: String
		PW: String
		ETC: String
		DRIVER_ID: String
		JOB_TYPE: String
		JOB_POSITION: String
		NAME: String
		SSN: String
		TEL: String
		JOB_STATUS: String
		CAR_NUM: String
		JOIN_DTTI: String
		LEAVE_DTTI: String
		ADDRESS : String
		DRIVER_LICENSE_NUM: String
		DRIVER_LICENSE_CREATE: String
		LICENSE_NUM: String
		LICENSE_CREATE: String
	): ResultsCount
	
	deleteUserInfoByNo(
		NO:ID!
	): ResultsCount


""" car info """
	insertCarInfo(
		OFFICE_ID : String
		CAR_NUM : String
		CAR_NAME : String
		CAR_TYPE : String
		DRIVE_TYPE : String
		DRIVE_MODE : String
		VEHICLE_TYPE : String
		VEHICLE_YEAR : String
		VEHICLE_REG : String
		VEHICLE_EXPNG : String
		VEHICLE_NUM : String
		VEHICLE_INSPECTION_ST : String
		VEHICLE_INSPECTION_ED : String
		METER_INSPECTION_ST : String
		METER_INSPECTION_ED : String
		LIABILITY_INSURANCE_ST : String
		LIABILITY_INSURANCE_ED : String
		COMPRH_INSURANCE_ST : String
		COMPRH_INSURANCE_ED : String
	):ResultsCount

	updateCarInfoByNo(
		NO:ID!
		CAR_NUM : String
		CAR_NAME : String
		CAR_TYPE : String
		DRIVE_TYPE : String
		DRIVE_MODE : String
		VEHICLE_TYPE : String
		VEHICLE_YEAR : String
		VEHICLE_REG : String
		VEHICLE_EXPNG : String
		VEHICLE_NUM : String
		VEHICLE_INSPECTION_ST : String
		VEHICLE_INSPECTION_ED : String
		METER_INSPECTION_ST : String
		METER_INSPECTION_ED : String
		LIABILITY_INSURANCE_ST : String
		LIABILITY_INSURANCE_ED : String
		COMPRH_INSURANCE_ST : String
		COMPRH_INSURANCE_ED : String
	): ResultsCount
	
	deleteCarInfoByNo(
		NO:ID!
	): ResultsCount

}


""" 1분마다 좌표"""
type DriveOneMinInfo {
	INFO_DTTI: ID
	CAR_NUM: String
	DRIVER_ID: Users
	SPEED: String
	DIST: String
	CAR_X: Float
	CAR_Y: Float 
	STATE: String
	OFFICE_ID: String
}

""" 운수사별 crud """
type Office {
	NO: ID
	OFFICE_ID: String
	OFFICE_NAME: String
	CEO_NAME: String
	CEO_TEL: String
	FAX : String
	ADDRESS : String
	OFFICE_TYPE : String
	SET_TIME : String
	REG_DTTI : String
 
}
 
input OfficeInput {
	NO: ID
	OFFICE_ID: String
	OFFICE_NAME: String
	CEO_NAME: String
	CEO_TEL: String
	FAX : String
	ADDRESS : String
	OFFICE_TYPE : String
	SET_TIME : String
	REG_DTTI : String
}
 
type WorkDailySeq {
	NO : ID
	OFFICE_ID: String
	REPORT_TYPE: String
	REPORT_DATE: String
	CAR_NUM: String
	DRIVER_ID: Users
	BC_DTTI : String
	DV_DTTI : String
	P_DTTI : String
	FARE : Int
	PAYTYPE : Int
	ADD_FARE : Int
	TIME_EXTRA_FARE : Int
	BLANK_DIST : Int
	WORK_DIST : Int
	SEQ_GROUP:String
}


type Users {
	NO: ID
	OFFICE_ID: String
	ROLES: String
	ID: String
	PW: String
	ETC: String
	DRIVER_ID: String
	JOB_TYPE: String
	JOB_POSITION: String
	NAME: String
	SSN: String
	TEL: String
	JOB_STATUS: String
	CAR_NUM: String
	JOIN_DTTI: String
	LEAVE_DTTI: String
	ADDRESS: String
	DRIVER_LICENSE_NUM: String
	DRIVER_LICENSE_CREATE: String
	LICENSE_NUM: String
	LICENSE_CREATE: String
	LOGIN_ERR_CNT:Int 
	REG_DTTI: String
}


input UsersInput {
	NO: ID
	OFFICE_ID: String
	ROLES: String
	ID: String
	PW: String
	OFFICE_NAME: String
	ETC: String
	DRIVER_ID: String
	JOB_TYPE: String
	JOB_POSITION: String
	NAME: String
	SSN: String
	TEL: String
	JOB_STATUS: String
	CAR_NUM: String
	JOIN_DTTI: String
	LEAVE_DTTI: String
	DRIVER_LICENSE_NUM: String
	DRIVER_LICENSE_CREATE: String
	LICENSE_NUM: String
	LICENSE_CREATE: String
	LOGIN_ERR_CNT:Int 
	REG_DTTI: String
}

type Cars {
	NO: ID
	OFFICE_ID : String
	CAR_NUM : String
	CAR_NAME : String
	CAR_TYPE : String
	DRIVE_TYPE : String
	DRIVE_MODE : String
	VEHICLE_TYPE : String
	VEHICLE_YEAR : String
	VEHICLE_REG : String
	VEHICLE_EXPNG : String
	VEHICLE_NUM : String
	VEHICLE_INSPECTION_ST : String
	VEHICLE_INSPECTION_ED : String
	METER_INSPECTION_ST : String
	METER_INSPECTION_ED : String
	LIABILITY_INSURANCE_ST : String
	LIABILITY_INSURANCE_ED : String
	COMPRH_INSURANCE_ST : String
	COMPRH_INSURANCE_ED : String
	REG_DTTI: String
}


input CarsInput {
	OFFICE_ID : String
	CAR_NUM : String
	CAR_NAME : String
	CAR_TYPE : String
	DRIVE_TYPE : String
	DRIVE_MODE : String
	VEHICLE_TYPE : String
	VEHICLE_YEAR : String
	VEHICLE_REG : String
	VEHICLE_EXPNG : String
	VEHICLE_NUM : String
	VEHICLE_INSPECTION_ST : String
	VEHICLE_INSPECTION_ED : String
	METER_INSPECTION_ST : String
	METER_INSPECTION_ED : String
	LIABILITY_INSURANCE_ST : String
	LIABILITY_INSURANCE_ED : String
	COMPRH_INSURANCE_ST : String
	COMPRH_INSURANCE_ED : String
}



input inputClosing{
	DRIVER_ID : String
	ST_DTTI	  : String
	ED_DTTI   : String
}

input inputDriverIDs{
	DRIVER_ID : String
	ST_DTTI	  : String
	ED_DTTI   : String
}
"""
type Other
"""

type TotalbyDriverId {
	DRIVER_ID: Users
	CAR_NUM: String
	ST_DTTI: String
	ED_DTTI: String
	ALL_FARE : Int
	WORK_DIST: Int
	BLANK_DIST: Int
	EMPTY_TIME: Int
	DRIVE_TIME: Int
	CASH : Int
	CARD : Int
	EXTRA: Int
	DRIVE_CNT : Int
	ADD_DRIVE_CNT: Int
	EXTRA_CNT: Int
}

type ResultsCount {
	totalCount: Int!
}

type AuthPayload {
	token: String
	user: Users
}
`;
// module.exports = [Greeting, Query, Mutation]
module.exports = [typeDefs];



