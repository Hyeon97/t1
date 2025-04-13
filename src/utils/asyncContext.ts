import { AsyncLocalStorage } from "async_hooks"
import { v4 as uuid } from "uuid"
import { DateTimeUtils } from "./Dayjs.utils"

/**
 * 요청 정보 인터페이스
 */
export interface RequestInfo {
  method: string // 작업 요청 API 메서드
  url: string // 작업 요청 URL
  query: Record<string, any> | null // 작업 요청 query
  body: Record<string, any> | null // 작업 요청 body
}

/**
 * 작업 추적 정보 인터페이스
 */
export interface TaskInfo {
  id: string // 작업 ID (자동 부여)
  controller: string // 작업에 사용된 컨트롤러 이름
  service: string[] // 작업에 사용된 서비스 이름들
  repository: string[] // 작업에 사용된 레포지토리 이름들
  sql: string[] // 작업에 사용된 SQL 쿼리문들
  order: Record<string, any>[] // 작업에 실행된 함수 이름 순서
}

/**
 * 타임스탬프 정보 인터페이스
 */
export interface TimestampInfo {
  start: number // 작업 시작 시간
  end: number // 작업 종료 시간
  duration: string // 작업 소요 시간
}

/**
 * 전체 컨텍스트 인터페이스
 */
export interface Context {
  request: RequestInfo
  task: TaskInfo
  timestamp: TimestampInfo
  status: number | null // 요청 결과 상태 코드
}

/**
 * AsyncContext 클래스
 * 요청별 컨텍스트를 관리하는 클래스
 */
export class AsyncContext {
  private static instance: AsyncContext
  private storage: AsyncLocalStorage<Partial<Context>>

  private constructor() {
    this.storage = new AsyncLocalStorage<Partial<Context>>()
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): AsyncContext {
    if (!AsyncContext.instance) {
      AsyncContext.instance = new AsyncContext()
    }
    return AsyncContext.instance
  }

  /**
   * 컨텍스트 초기화 및 실행
   */
  public run(callback: () => void, req?: any): void {
    const taskId = uuid()
    const startTime = Date.now()

    // 초기 컨텍스트 생성
    const initialContext: Partial<Context> = {
      request: req
        ? {
            method: req.method || "",
            url: req.originalUrl || req.url || "",
            query: req.query || null,
            body: req.body || null,
          }
        : { method: "", url: "", query: null, body: null },
      task: {
        id: taskId,
        controller: "",
        service: [],
        repository: [],
        sql: [],
        order: [],
      },
      timestamp: {
        start: startTime,
        end: 0,
        duration: "-",
      },
      status: null,
    }

    this.storage.run(initialContext, callback)
  }

  /**
   * 현재 컨텍스트 전체 반환
   */
  public getContext(): Partial<Context> | undefined {
    return this.storage.getStore()
  }

  /**
   * 요청 정보 반환
   */
  public getRequestInfo(): RequestInfo | undefined {
    const store = this.storage.getStore()
    return store?.request
  }

  /**
   * 작업 정보 반환
   */
  public getTaskInfo(): TaskInfo | undefined {
    const store = this.storage.getStore()
    return store?.task
  }

  /**
   * 작업 ID 반환
   */
  public getTaskID(): string | undefined {
    const store = this.storage.getStore()
    return store?.task?.id
  }

  /**
   * 타임스탬프 정보 반환
   */
  public getTimestampInfo(): TimestampInfo | undefined {
    const store = this.storage.getStore()
    return store?.timestamp
  }

  /**
   * 상태 코드 반환
   */
  public getStatus(): number | null | undefined {
    const store = this.storage.getStore()
    return store?.status
  }

  /**
   * 컨트롤러 이름 설정
   */
  public setController({ name }: { name: string }): void {
    const store = this.storage.getStore()
    if (store?.task) {
      store.task.controller = name
      // store.task.order.push(`Controller:${name}`)
    }
  }

  /**
   * 서비스 이름 추가
   */
  public addService({ name }: { name: string }): void {
    const store = this.storage.getStore()
    if (store?.task) {
      if (!store.task.service.includes(name)) {
        store.task.service.push(name)
      }
      // store.task.order.push(`Service:${name}`)
    }
  }

  /**
   * 레포지토리 이름 추가
   */
  public addRepository({ name }: { name: string }): void {
    const store = this.storage.getStore()
    if (store?.task) {
      if (!store.task.repository.includes(name)) {
        store.task.repository.push(name)
      }
      // store.task.order.push(`Repository:${name}`)
    }
  }

  /**
   * SQL 쿼리 추가
   */
  public addSql({ query }: { query: string }): void {
    const store = this.storage.getStore()
    if (store?.task) {
      store.task.sql.push(query)
    }
  }

  /**
   * 실행 함수 순서 추가
   */
  public addOrder({ component, method, state }: { component: string; method: string; state: "start" | "end" }): void {
    const now = DateTimeUtils.getLogTimestamp()
    const store = this.storage.getStore()
    if (store?.task) {
      // store.task.order.push(`[ ${now} ]${method}`)
      store.task.order.push({
        timestamp: now,
        state,
        component,
        method,
      })
    }
  }

  /**
   * 응답 완료 처리
   */
  public complete({ status }: { status: number }): void {
    const store = this.storage.getStore()
    if (store?.timestamp) {
      const endTime = Date.now()
      store.timestamp.end = endTime
      store.timestamp.duration = `${endTime - store.timestamp.start}ms`
    }
    if (store) {
      store.status = status
    }
  }

  /**
   * 실행 시간 계산 (작업 종료 전에도 호출 가능)
   */
  public getDuration(): string {
    const store = this.storage.getStore()
    if (!store?.timestamp) return "-"

    if (store.timestamp.end > 0) {
      return `${store.timestamp.duration}ms`
    } else {
      return `${Date.now() - store.timestamp.start}ms`
    }
  }
}

// 편의를 위한 싱글톤 인스턴스 익스포트
export const asyncContextStorage = AsyncContext.getInstance()
