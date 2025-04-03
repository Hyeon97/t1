import { BaseRepository } from "../../../utils/base/base-repository"

export class ZdmZosRepositoryRepository extends BaseRepository {
  constructor() {
    super({
      tableName: "center_zos_repository",
      entityName: "CenterZosRepository",
    })
  }
}
