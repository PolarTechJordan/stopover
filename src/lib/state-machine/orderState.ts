import { OrderStatus } from '../types';

export interface Transition {
  from: OrderStatus;
  to: OrderStatus;
  trigger: string;
  description: string;
}

export const orderTransitions: Transition[] = [
  {
    from: 'paid',
    to: 'baggage_received',
    trigger: 'RECEIVE_BAGGAGE',
    description: '中转柜台收取托运行李，贴上 RFID 电子标签'
  },
  {
    from: 'baggage_received',
    to: 'in_lounge',
    trigger: 'ENTER_LOUNGE',
    description: '旅客进入机场贵宾室休息，行李转运至贵宾室专用寄存区'
  },
  {
    from: 'baggage_received',
    to: 'in_city_tour',
    trigger: 'START_CITY_TOUR',
    description: '旅客登上专属接送车，开启城市半日游/一日游'
  },
  {
    from: 'baggage_received',
    to: 'at_hotel',
    trigger: 'CHECK_IN_HOTEL',
    description: '旅客乘专车抵达合作酒店，办理入住，行李直送至房间'
  },
  {
    from: 'in_city_tour',
    to: 'in_lounge',
    trigger: 'ENTER_LOUNGE_AFTER_TOUR',
    description: '城市微游结束，专车送回机场，旅客进入贵宾厅享用餐食'
  },
  {
    from: 'in_city_tour',
    to: 'at_hotel',
    trigger: 'CHECK_IN_HOTEL_AFTER_TOUR',
    description: '微游结束，专车送往合作酒店进行跨夜休息'
  },
  {
    from: 'in_lounge',
    to: 'baggage_returning',
    trigger: 'PREPARE_RETURN',
    description: '离境航班起飞前 90 分钟，行李服务处开始将托管行李运往归还点'
  },
  {
    from: 'in_city_tour',
    to: 'baggage_returning',
    trigger: 'PREPARE_RETURN_FROM_TOUR',
    description: '离境起飞时间临近，微游返程，行李运往机场归还点'
  },
  {
    from: 'at_hotel',
    to: 'baggage_returning',
    trigger: 'CHECK_OUT',
    description: '酒店退房，专车送回机场，行李运往机场归还点'
  },
  {
    from: 'baggage_returning',
    to: 'boarded',
    trigger: 'BOARD',
    description: '旅客签收领回行李，完成快速安检，顺利登机'
  },
  {
    from: 'boarded',
    to: 'completed',
    trigger: 'COMPLETE',
    description: '中转旅程圆满完成，航段已起飞'
  },
  // 误机与异常分支
  {
    from: 'in_city_tour',
    to: 'missed_flight',
    trigger: 'TIMEOUT',
    description: '模拟路况异常或游客滞留，导致无法按时回机场，触发误机保障'
  },
  {
    from: 'at_hotel',
    to: 'missed_flight',
    trigger: 'TIMEOUT_HOTEL',
    description: '因天气或特殊原因延误，触发误机保障'
  },
  {
    from: 'missed_flight',
    to: 'refunded',
    trigger: 'REFUND',
    description: '启动“误机险”赔付流程，全额退款套餐费，并由客服协助改签下一班航班'
  }
];

export function getNextStatus(current: OrderStatus, trigger: string): OrderStatus {
  const transition = orderTransitions.find(t => t.from === current && t.trigger === trigger);
  if (!transition) {
    console.warn(`No transition found for current status: ${current} and trigger: ${trigger}`);
    return current;
  }
  return transition.to;
}

export function getAvailableTriggers(current: OrderStatus): Transition[] {
  return orderTransitions.filter(t => t.from === current);
}
