/* eslint-disable prefer-arrow-callback */

import chai from 'chai'
import { formatFromIRCToDiscord } from '../lib/formatting'

chai.should()

describe('Formatting', () => {
  describe('IRC to Discord', () => {
    it('should convert bold IRC format', () => {
      formatFromIRCToDiscord('\x02text\x02').should.equal('**text**')
    })

    it('should convert reverse IRC format', () => {
      formatFromIRCToDiscord('\x16text\x16').should.equal('*text*')
    })

    it('should convert italic IRC format', () => {
      formatFromIRCToDiscord('\x1dtext\x1d').should.equal('*text*')
    })

    it('should convert underline IRC format', () => {
      formatFromIRCToDiscord('\x1ftext\x1f').should.equal('__text__')
    })

    it('should ignore color IRC format', () => {
      formatFromIRCToDiscord('\x0306,08text\x03').should.equal('text')
    })

    it('should convert nested IRC format', () => {
      formatFromIRCToDiscord('\x02bold \x16italics\x16\x02').should.equal(
        '**bold *italics***'
      )
    })

    it('should convert nested IRC format', () => {
      formatFromIRCToDiscord('\x02bold \x1funderline\x1f\x02').should.equal(
        '**bold __underline__**'
      )
    })
  })
})
