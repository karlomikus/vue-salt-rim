import messages from './messages/zh-CN.json'

const datetime = {
    'short': {
        'year': 'numeric',
        'month': 'short',
        'day': 'numeric'
    },
    'long': {
        'year': 'numeric',
        'month': 'short',
        'day': 'numeric',
        'weekday': 'short',
        'hour': 'numeric',
        'minute': 'numeric'
    }
}

const numbers = {
    decimal: {
        style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2
    }
}

export default { messages, datetime, numbers }
