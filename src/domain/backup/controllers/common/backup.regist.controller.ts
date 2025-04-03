// import { NextFunction, Response } from "express"
// import { JobError } from "../../../../errors/domain-errors/JobError"
// import { handleControllerError } from "../../../../errors/handler/integration-error-handler"
// import { ExtendedRequest } from "../../../../types/common/req.types"
// import { ApiUtils } from "../../../../utils/api/api.utils"
// import { ContextLogger } from "../../../../utils/logger/logger.custom"
// import { BackupRegistService } from "../../services/backup.service"
// import { BackupRegistRequestBody } from "../../types/backup-regist.type"

// export class BackupRegistController {
//   private readonly backupService: BackupService
//   private readonly backupRegistService: BackupRegistService

//   constructor({ backupService, backupRegistService }: { backupService: BackupService; backupRegistService: BackupRegistService }) {
//     this.backupService = backupService
//     this.backupRegistService = backupRegistService
//   }

//   /**
//    * Backup 작업 등록
//    */
//   regist = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       ContextLogger.debug({ message: `Backup 작업 정보 등록 시작` })

//       //  user data 추출
//       const userData = req.user
//       ContextLogger.debug({ message: `요청 사용자 정보`, meta: userData })

//       //  body data 추출
//       const data = req.body as BackupRegistRequestBody
//       if (!data.user) data.user = userData?.email

//       //  서비스 호출
//       const resultData = await this.backupRegistService.regist({ data })

//       //  출력 가공
//       const result = {
//         backupName: "test backup name",
//       }
//       ApiUtils.success({ res, data: result, message: "Backup job data regist success" })
//     } catch (error) {
//       return handleControllerError({
//         next,
//         error,
//         logErrorMessage: "Backup 작업 정보 등록 중 Controller.regist() 오류 발생",
//         apiErrorMessage: "Backup 작업 정보 등록 중 오류가 발생했습니다",
//         operation: "server 조회",
//         processingStage: "조회",
//         errorCreator: (params) => new JobError.DataProcessingError(params),
//       })
//     }
//   }
// }
