import { BaseRepository } from "../../../utils/base/base-repository"

export class ZdmZosRepositoryRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "ZdmZosRepository",
      tableName: "center_zos_repository",
    })
  }
}
