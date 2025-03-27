//  repository 공통 ( DB와 상호작용하는 repository를 의미 )
export abstract class CommonRepository {
  protected abstract readonly tableName: string
  protected conditions: string[] = []
  protected params: any[] = []
  protected rawConditions: string[] = [] // 파라미터가 없는 조건

  /**
   * 조건과 파라미터 초기화
   */
  protected resetQueryState(): void {
    this.conditions = []
    this.params = []
  }

  /**
   * 파라미터가 존재하는 WHERE 조건 추가
   */
  protected addCondition({ condition, params }: { condition: string; params: any[] }): this {
    this.conditions.push(condition)
    this.params.push(...params)
    return this
  }

  /**
   * 파라미터가 없는 원시 SQL 조건 추가
   */
  protected addRawCondition({ condition }: { condition: string }): this {
    this.rawConditions.push(condition)
    return this
  }

  /**
   * WHERE 절 생성
   */
  protected buildWhereClause(): string {
    const allConditions = [...this.conditions, ...this.rawConditions]
    return allConditions.length > 0 ? ` WHERE ${allConditions.join(" AND ")}` : ""
  }
}
